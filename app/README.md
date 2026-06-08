# ⏰ WakeMeUp

**WakeMeUp** é um aplicativo web voltado para dispositivos móveis (*mobile-first*) projetado para passageiros de transporte público e viajantes que desejam cochilar ou se distrair durante a viagem sem correr o risco de perder a parada de descida. 

O aplicativo utiliza a geolocalização em tempo real do aparelho para disparar um alarme sonoro e vibratório assim que o usuário entra no raio de proximidade configurado para o seu destino.

---

## 🗺️ Como Funciona? (Fluxo de Uso)

O fluxo da aplicação é dividido em 4 etapas principais e intuitivas:

### 1. Seleção de Destino
*   **Mapa Interativo (Dark Theme):** Ao abrir o app, você visualiza um mapa estilizado onde é exibido o seu ponto de localização atual.
*   **Busca Rápida:** Digite o nome da estação ou ponto de ônibus no campo de busca para encontrar seu destino rapidamente.
*   **Clique no Mapa:** Caso prefira, você pode tocar/clicar diretamente em qualquer ponto no mapa para definir sua parada de destino.

### 2. Configuração do Alarme
Depois de escolher o destino, você define os parâmetros do seu alarme:
*   **Raio de Alerta:** Escolha a distância ideal para ser acordado/notificado (opções de **100m, 200m, 500m, 1km ou 2km**).
*   **Tipo de Alerta:** Habilite ou desabilite o **Som de Alarme** e a **Vibração** de acordo com sua preferência ou ambiente.

### 3. Modo de Viagem (Acompanhamento em Tempo Real)
*   **Acompanhamento Visual:** Um traçado tracejado no mapa liga sua posição atual ao destino.
*   **Distância Dinâmica:** O app atualiza constantemente a distância restante até a sua parada.
*   **Barra de Progresso:** Um indicador visual mostra o andamento da sua viagem, facilitando saber se você está perto ou longe de forma rápida.

### 4. Alerta de Chegada (Despertador)
*   **Tela de Alerta Urgente:** Assim que você cruza a linha do raio de alerta definido, o app muda para uma tela piscante de alta prioridade.
*   **Alarme Sonoro & Vibração:** O smartphone começa a tocar e vibrar imediatamente para garantir que você acorde ou preste atenção na sua descida.
*   **Ação Simples:** Um botão proeminente de "PARAR ALARME" finaliza a viagem e retorna você para a tela inicial.

---

## 🚀 Principais Recursos e Diferenciais

*   **Geolocalização Precisa:** Integração nativa com a API de Geolocalização do navegador para leitura contínua das coordenadas do dispositivo.
*   **Interface Premium & Dinâmica:** Layout escuro (*dark mode*) elegante, construído com micro-animações fluidas no carregamento e transição de telas (Framer Motion).
*   **Design Responsivo:** Focado na experiência de uso em smartphones, garantindo que o mapa e os botões fiquem perfeitamente acessíveis na palma da mão durante a viagem.
*   **Privacidade:** Todo o processamento de localização e monitoramento de distância é feito localmente no próprio navegador, sem armazenar ou enviar seus dados de posição para servidores externos.

---

## 🛠️ Tecnologias Utilizadas

*   **React** (Interface baseada em componentes reativos)
*   **TypeScript** (Segurança e tipagem estática no desenvolvimento)
*   **Vite** (Ambiente rápido de desenvolvimento e build otimizado)
*   **Tailwind CSS** (Estilização responsiva e moderna)
*   **Leaflet & React-Leaflet** (Renderização do mapa interativo e manipulação de camadas)
*   **Framer Motion** (Animações de transição de telas e elementos interativos)
*   **Lucide React** (Conjunto de ícones minimalistas e modernos)
