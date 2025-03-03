// main.js - Arquivo principal do Electron

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { networkInterfaces } = require('os');
const multer = require('multer');

// Criar servidor Express
const server = express();
server.use(cors());

// Configurar limites para processamento de dados grandes
server.use(bodyParser.json({ limit: '520mb' }));
server.use(bodyParser.urlencoded({ extended: true, limit: '520mb' }));

// Configurar timeout para requisições longas (5 minutos)
server.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutos em milissegundos
  next();
});

// Pasta para salvar os arquivos recebidos
const downloadPath = path.join(app.getPath('downloads'), 'Sendify');

// Garantir que a pasta de download exista
if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath, { recursive: true });
}

// Configurar armazenamento Multer para arquivos grandes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, downloadPath);
  },
  filename: (req, file, cb) => {
    // Preservar o nome original do arquivo
    cb(null, file.originalname);
  }
});

// Configurar middleware Multer com limites
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 524288000, // 500MB em bytes
  }
});

// Armazenar dispositivos conectados
const connectedDevices = [];

// Armazenar arquivos disponíveis para envio aos dispositivos móveis
const filesToSend = [];

// Configurar rotas do servidor
server.post('/connect', (req, res) => {
  const { deviceName, deviceType } = req.body;
  
  // Adicionar dispositivo à lista se ainda não estiver
  const deviceExists = connectedDevices.some(device => 
    device.name === deviceName && device.type === deviceType
  );
  
  if (!deviceExists) {
    connectedDevices.push({
      id: Date.now().toString(),
      name: deviceName,
      type: deviceType,
      lastSeen: new Date()
    });
    
    // Notificar interface sobre novo dispositivo
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('device-connected', {
        devices: connectedDevices
      });
    }
  }
  
  res.status(200).json({ success: true, message: 'Conectado com sucesso' });
});

server.post('/upload', (req, res) => {
  const { filename, data, fileType } = req.body;
  
  if (!filename || !data) {
    return res.status(400).json({ success: false, message: 'Nome do arquivo e dados são obrigatórios' });
  }
  
  try {
    // Decodificar base64 para buffer
    const fileBuffer = Buffer.from(data, 'base64');
    
    // Caminho completo para salvar o arquivo
    const filePath = path.join(downloadPath, filename);
    
    // Salvar arquivo
    fs.writeFileSync(filePath, fileBuffer);
    
    // Notificar a interface sobre o novo arquivo
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file-received', {
        name: filename,
        path: filePath,
        size: fileBuffer.length,
        type: fileType,
        receivedAt: new Date()
      });
    }
    
    res.status(200).json({ success: true, message: 'Arquivo recebido com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar arquivo' });
  }
});

// Rota para upload de arquivos grandes usando Multer
server.post('/upload-file', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo recebido' });
    }
    
    // Informações do arquivo
    const fileInfo = {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      receivedAt: new Date()
    };
    
    // Notificar a interface sobre o novo arquivo
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file-received', fileInfo);
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Arquivo grande recebido com sucesso',
      file: fileInfo
    });
  } catch (error) {
    console.error('Erro ao processar arquivo grande:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar arquivo grande' });
  }
});

// Nova rota para o desktop adicionar arquivos para envio aos dispositivos
server.post('/prepare-send', (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Caminho do arquivo inválido ou arquivo não encontrado' 
      });
    }
    
    const filename = path.basename(filePath);
    const fileStats = fs.statSync(filePath);
    const fileId = Date.now().toString();
    
    // Determinando o tipo de arquivo
    let fileType = 'application/octet-stream';
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      fileType = `image/${ext.substring(1)}`;
    } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
      fileType = 'video/mp4';
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      fileType = 'audio/mpeg';
    } else if (ext === '.pdf') {
      fileType = 'application/pdf';
    } else if (['.doc', '.docx'].includes(ext)) {
      fileType = 'application/msword';
    }
    
    // Adicionar à lista de arquivos para envio
    filesToSend.push({
      id: fileId,
      name: filename,
      path: filePath,
      size: fileStats.size,
      type: fileType,
      addedAt: new Date()
    });
    
    // Notificar a interface sobre o arquivo adicionado
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('file-ready-to-send', {
        id: fileId,
        name: filename,
        size: fileStats.size,
        type: fileType
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Arquivo pronto para envio',
      fileId: fileId
    });
  } catch (error) {
    console.error('Erro ao preparar arquivo para envio:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao preparar arquivo para envio' 
    });
  }
});

// Rota para o dispositivo móvel verificar arquivos disponíveis para download
server.get('/available-files', (req, res) => {
  const availableFiles = filesToSend.map(file => ({
    id: file.id,
    name: file.name,
    size: file.size,
    type: file.type,
    addedAt: file.addedAt
  }));
  
  res.status(200).json({ 
    success: true, 
    files: availableFiles 
  });
});

// Rota para o dispositivo móvel baixar um arquivo específico
server.get('/download/:fileId', (req, res) => {
  const { fileId } = req.params;
  const file = filesToSend.find(f => f.id === fileId);
  
  if (!file) {
    return res.status(404).json({ 
      success: false, 
      message: 'Arquivo não encontrado' 
    });
  }
  
  try {
    res.setHeader('Content-Type', file.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erro ao enviar arquivo para download:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar arquivo para download' 
    });
  }
});

// Rota para remover um arquivo da lista de envio
server.delete('/file/:fileId', (req, res) => {
  const { fileId } = req.params;
  
  const fileIndex = filesToSend.findIndex(f => f.id === fileId);
  if (fileIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      message: 'Arquivo não encontrado' 
    });
  }
  
  filesToSend.splice(fileIndex, 1);
  
  // Notificar a interface sobre a remoção
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-removed', { fileId });
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'Arquivo removido da lista de envio' 
  });
});

// Iniciar servidor na porta 3000
const serverInstance = server.listen(3000, () => {
  console.log('Servidor Express iniciado na porta 3000');
});

// Configurar timeout do servidor para uploads grandes (10 minutos)
serverInstance.timeout = 600000; // 10 minutos em milissegundos

// Tratamento de erros para Multer e uploads grandes
server.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erro específico do Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        success: false, 
        message: 'Arquivo muito grande. O limite é de 500MB.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: `Erro no upload: ${err.message}` 
    });
  } else if (err) {
    // Outros erros
    console.error('Erro no servidor:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor durante o upload' 
    });
  }
  next();
});

// Obter endereços IP locais
function getLocalIPs() {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Filtrar apenas IPv4, não-loopback e IPs que começam com 192.168
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168')) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

// Variável para armazenar a janela principal
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Remover menu explicitamente
  mainWindow.setMenu(null);

  mainWindow.loadFile('index.html');
  
  // Enviar IPs locais para a janela
  const ipAddresses = getLocalIPs();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('ip-addresses', ipAddresses);
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Remover menu da aplicação
  Menu.setApplicationMenu(null);
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Encerrar servidor ao sair
app.on('will-quit', () => {
  if (serverInstance) {
    serverInstance.close();
  }
});

// Manipuladores IPC
ipcMain.on('select-directory', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const newPath = result.filePaths[0];
    fs.mkdirSync(newPath, { recursive: true });
    event.reply('directory-selected', newPath);
  }
});

// Manipulador para enviar arquivo para um dispositivo (implementação futura)
ipcMain.on('send-file-to-device', async (event, { deviceId, filePath }) => {
  // Código para enviar arquivo para um dispositivo móvel
  // Seria implementado em uma versão futura
});

// Adicionar tratamento de mensagens do IPC para selecionar arquivos
ipcMain.on('select-files-to-send', async (event) => {
  if (!mainWindow) return;
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      title: 'Selecione arquivos para enviar ao dispositivo móvel',
      buttonLabel: 'Selecionar para envio'
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      // Para cada arquivo selecionado, preparar para envio
      for (const filePath of result.filePaths) {
        fetch(`http://localhost:3000/prepare-send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath })
        }).catch(err => console.error('Erro ao preparar arquivo:', err));
      }
    }
  } catch (error) {
    console.error('Erro ao selecionar arquivos:', error);
  }
});

// Rota para o cliente buscar o QR Code
server.get('/qrcode', (req, res) => {
  // Obter o endereço IP do servidor
  const networkInterfaces = getLocalIPs();
  if (networkInterfaces.length === 0) {
    return res.status(500).json({
      success: false,
      message: 'Não foi possível obter o endereço IP do servidor'
    });
  }
  
  const serverIP = networkInterfaces[0];
  const connectionData = {
    ip: serverIP,
    port: 3000
  };
  
  res.status(200).json({
    success: true,
    connectionData
  });
});