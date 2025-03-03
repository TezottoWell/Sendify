# Sendify 📱 💻 📁

<div align="center">
  <img src="https://img.shields.io/badge/plataforma-iOS%20%7C%20Android%20%7C%20Windows%20%7C%20Mac%20%7C%20Linux-blue" alt="Plataforma" />
  <img src="https://img.shields.io/badge/framework-React%20Native%20%7C%20Electron-brightgreen" alt="Framework" />
  <img src="https://img.shields.io/badge/licença-MIT-orange" alt="Licença" />
</div>

<div align="center">
  <img src="https://i.imgur.com/3ri7C3Q.png" alt="Sendify Logo" width="250" />
  <br />
  <h3>Transferência de arquivos bidirecional entre dispositivos móveis e desktop de forma simples e rápida.</h3>
</div>

## 🚀 Visão Geral

Sendify é uma solução completa para transferência de arquivos entre dispositivos móveis e computadores, sem a necessidade de cabos ou serviços em nuvem. Conecte seus dispositivos na mesma rede Wi-Fi e transfira arquivos em ambas as direções com facilidade e segurança.

### ✨ Recursos Principais

- **Transferência Bidirecional**: Envie arquivos do mobile para o desktop e do desktop para o mobile
- **Interface Intuitiva**: Design moderno e fácil de usar em ambas as plataformas
- **Sem Cadastro**: Não requer criação de conta ou autenticação
- **Segurança Local**: Todos os dados são transferidos apenas dentro da sua rede local
- **Múltiplos Dispositivos**: Conecte vários smartphones e tablets simultaneamente
- **Suporte a Arquivos Grandes**: Transferência eficiente de arquivos grandes

## 💻 Componentes do Projeto

O projeto Sendify é composto por duas aplicações independentes que se comunicam entre si:

### 📱 Aplicativo Mobile (Sendify)

- Desenvolvido com **React Native** e **Expo**
- Interface intuitiva para selecionar e enviar arquivos
- Permite visualizar e baixar arquivos compartilhados pelo desktop
- Suporta iOS e Android
- Exibe a lista de arquivos disponíveis para download

### 🖥️ Aplicativo Desktop (desktop-app)

- Desenvolvido com **Electron** e **Express**
- Servidor embutido para comunicação com dispositivos
- Interface gráfica para monitorar conexões e arquivos recebidos
- Permite selecionar e compartilhar arquivos com dispositivos móveis
- Suporta Windows, macOS e Linux

## 📷 Capturas de Tela

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Aplicativo Mobile</strong></td>
      <td align="center"><strong>Aplicativo Desktop</strong></td>
    </tr>
    <tr>
      <td><img src="https://i.imgur.com/I6DXdpf.png" alt="Desktop App" width="500" /></td>
      <td><img src="https://i.imgur.com/nGod14V.png" alt="Mobile App" width="280" /></td>
    </tr>
  </table>
</div>

## 🛠️ Tecnologias Utilizadas

### Aplicativo Mobile
- **React Native**: Framework para desenvolvimento mobile multiplataforma
- **Expo**: Plataforma para desenvolvimento React Native simplificado
- **AsyncStorage**: Armazenamento persistente de dados
- **FileSystem**: Gerenciamento de arquivos no dispositivo
- **LinearGradient**: Efeitos visuais para a interface

### Aplicativo Desktop
- **Electron**: Framework para desenvolvimento desktop multiplataforma
- **Express**: Servidor web para comunicação com os dispositivos
- **Multer**: Gerenciamento de upload de arquivos
- **CORS**: Habilitando comunicação segura entre dispositivos
- **WebSockets**: Comunicação em tempo real (implementação futura)

## 🔧 Instalação e Uso

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn
- Expo CLI (para o aplicativo mobile)
- Dispositivos na mesma rede Wi-Fi

### Aplicativo Desktop
1. Clone o repositório
   ```bash
   git clone https://github.com/TezottoWell/Sendify.git
   cd sendify/desktop-app
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Inicie o aplicativo
   ```bash
   npm start
   ```

4. O aplicativo exibirá o endereço IP da sua rede local que deve ser usado para conectar dispositivos móveis.

### Aplicativo Mobile
1. Navegue até a pasta do projeto mobile
   ```bash
   cd sendify/Sendify
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Inicie o aplicativo
   ```bash
   npx expo start
   ```

4. Escaneie o QR code com o app Expo Go ou execute em um emulador.

## 📋 Como usar

### Enviar arquivos do dispositivo móvel para o desktop:
1. No aplicativo desktop, anote o endereço IP exibido
2. No aplicativo mobile, insira o endereço IP e conecte-se
3. Selecione os arquivos que deseja enviar
4. Toque em "Enviar" ou "Enviar Todos"
5. Os arquivos serão recebidos e exibidos no aplicativo desktop

### Enviar arquivos do desktop para o dispositivo móvel:
1. No aplicativo desktop, clique em "Selecionar Arquivos para Envio"
2. Escolha os arquivos que deseja compartilhar
3. No aplicativo mobile, toque em "Verificar Arquivos"
4. Os arquivos disponíveis serão exibidos
5. Toque em "Baixar" para salvar o arquivo no dispositivo

## 📱 Compatibilidade

### Mobile
- iOS 13 ou superior
- Android 7.0 ou superior

### Desktop
- Windows 10 ou superior
- macOS 10.13 ou superior
- Linux (principais distribuições)

## 🔄 Fluxo de Dados

O Sendify utiliza uma arquitetura cliente-servidor, onde:

1. O aplicativo desktop cria um servidor Express na rede local
2. O aplicativo mobile conecta-se ao servidor usando o endereço IP
3. Os arquivos são transferidos por HTTP utilizando:
   - Uploads de base64 para arquivos pequenos
   - Streaming para arquivos maiores
4. Os arquivos são armazenados localmente em ambos os dispositivos

## 🛣️ Roadmap

Funcionalidades planejadas para versões futuras:

- **Transferência via QR Code**: Conectar dispositivos escaneando um QR code
- **Modo Escuro**: Suporte a tema escuro em ambas as plataformas
- **Backup e Sincronização**: Sincronizar pastas automaticamente
- **Transferência Direta**: Comunicação P2P sem necessidade de servidor
- **Criptografia End-to-End**: Segurança aprimorada para todas as transferências

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Para questões, sugestões ou feedback, por favor abra uma issue no repositório do projeto.

---

<div align="center">
  <p>Desenvolvido com ❤️ usando React Native, Expo e Electron</p>
  <p>© 2023 Sendify. Todos os direitos reservados.</p>
</div> 
