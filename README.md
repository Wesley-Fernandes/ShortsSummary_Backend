# Backend do Projeto "Shorts Summary"

Bem-vindo ao repositório do Backend do projeto "Shorts Summary"! Este é o componente que alimenta a inteligência por trás da transformação de vídeos curtos do YouTube em resumos inteligentes usando IA (Inteligência Artificial).

## Visão Geral do Projeto

O projeto "Shorts Summary" tem como objetivo fornecer uma solução inteligente para resumir e extrair informações valiosas de vídeos curtos do YouTube. O Backend é a parte central desse projeto, lidando com a comunicação com a API do YouTube, o processamento de vídeos, a geração de resumos inteligentes com IA e a entrega desses resumos para os usuários.

## Tecnologias Utilizadas

O Backend do "Shorts Summary" foi desenvolvido com base em diversas tecnologias e bibliotecas:

- **Node.js e Express:** Utilizados para criar a estrutura do servidor e criar endpoints para manipular as solicitações dos clientes.

- **FFmpeg:** Utilizado para o processamento de vídeo, permitindo a extração de informações valiosas dos vídeos curtos.

- **OpenAI:** Integra a API da OpenAI para a geração de resumos inteligentes com base no conteúdo dos vídeos.

- **Socket.IO:** Usado para comunicação em tempo real com os clientes, permitindo que os usuários recebam resumos à medida que são gerados.

- **Axios:** Utilizado para fazer solicitações HTTP para a API do YouTube e outros serviços externos.

- **Cors:** Middleware para habilitar as solicitações CORS (Cross-Origin Resource Sharing).

- **Dotenv:** Utilizado para carregar variáveis de ambiente a partir de um arquivo `.env`.

- **@ffmpeg-installer/ffmpeg:** Ferramenta para instalar o FFmpeg de forma fácil e automática.

- **abort-controller:** Usado para controlar solicitações HTTP e interrompê-las quando necessário.

- **g:** Uma biblioteca para gerar IDs exclusivos de forma simples e eficiente.

- **mic:** Uma biblioteca para capturar áudio de dispositivos de gravação.

- **ytdl-core:** Utilizado para baixar informações de vídeos do YouTube.

## Configuração do Ambiente

Para configurar o ambiente de desenvolvimento do Backend, siga estas etapas:

1. Clone este repositório para sua máquina local.
2. Execute `npm install` ou `yarn install` para instalar as dependências do projeto.
3. Configure as variáveis de ambiente necessárias, incluindo a chave de API da OpenAI e outras configurações.
4. Execute `npm start` ou `yarn start` para iniciar o servidor do Backend.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir problemas (issues) ou enviar solicitações de pull (pull requests) para melhorar este projeto.

## Licença

Este projeto é distribuído sob a licença [MIT](LICENSE).

