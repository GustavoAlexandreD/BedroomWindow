# Bedroom Window 🪟✨

## Visão Geral

**Bedroom Window** é um jogo 3D imersivo desenvolvido como avaliação para a disciplina de Computação Gráfica. O jogador explora um ambiente 3D em primeira pessoa, interagindo com objetos do mundo virtual dentro de um quarto. O grande diferencial deste projeto é a **construção completa utilizando WebGL puro** (sem bibliotecas gráficas de alto nível como Three.js).

Seguindo as restrições acadêmicas da disciplina, toda a renderização 3D foi implementada utilizando **OpenGL/WebGL ≥ 4.0**, com implementação própria de leitor de arquivos OBJ e um pipeline gráfico completo que inclui transformações geométricas, iluminação Phong e mapeamento de texturas.

---

## 🎮 Mecânicas do Jogo

- **Movimentação em Primeira Pessoa:** Navegação livre pelo ambiente utilizando WASD ou Setas.
- **Interação com Câmera:** Controle de visão com mouse (rotação livre) para exploração completa do cenário.
- **Sistema de Iluminação Dinâmico:** Implementação do modelo de reflexão de Phong com fontes de luz móveis que afetam a iluminação de todos os objetos em tempo real.
- **Objetos Animados:** Transformações geométricas contínuas (rotação, escala, translação) aplicadas a objetos selecionados.
- **Materiais Variados:** Combinação de objetos com texturas mapeadas e objetos com cores sólidas.
- **Colisão Simples:** Prevenção de travessia de paredes durante a movimentação.

---

## ⚙️ Conceitos de Computação Gráfica Implementados

Para atender aos requisitos da disciplina, a arquitetura foi cuidadosamente estruturada para demonstrar domínio completo sobre o pipeline gráfico 3D:

### 1. **Projeção Perspectiva e Sistema de Câmera**
- **Matriz de Projeção Perspectiva:** Implementação da transformação perspective para simular profundidade realista.
- **Câmera em Primeira Pessoa (`src/graphics/camera.js`):** Sistema de câmera com yaw/pitch que permite rotação livre com mouse e movimentação com teclado.
- **View Matrix (LookAt):** Transformação de coordenadas do mundo para coordenadas de câmera utilizando a matriz lookAt.

### 2. **Iluminação com Modelo de Phong**
- **Reflexão Especular, Difusa e Ambiente:** Implementação completa do modelo de Phong em shader.
- **Fontes de Luz Móveis:** Pelo menos uma fonte de luz que se move dinamicamente pela cena, alterando a iluminação em tempo real.
- **Cálculo de Normais:** Normais por vértice calculadas e interpoladas no fragment shader para iluminação suave.

### 3. **Transformações Geométricas 3D**
- **Matrizes de Transformação (`src/utils/math.js`):** Implementação de matrizes 4x4 para translação, rotação e escala.
- **Objetos Animados:** Aplicação de transformações através de interações(rotação em torno de eixos, oscilação de posição, variação de escala).
- **Model-View-Projection (MVP):** Pipeline completo de transformação do espaço local para espaço de tela.

### 4. **Texturização 3D e Mapeamento UV**
- **Texture Mapping (`src/graphics/texture-loader.js`):** Carregamento e aplicação de texturas em objetos 3D.
- **Coordenadas UV:** Interpolação automática de coordenadas de textura pelo rasterizador.
- **Múltiplos Tipos de Material:** Suporte para objetos texturizados e objetos com cores sólidas.

### 5. **Leitor Próprio de Arquivos OBJ**
- **Parser OBJ Completo (`src/models/obj-loader.js`):** Implementação manual de leitor que:
  - Lê posições de vértices (v)
  - Lê normais de vértices (vn)
  - Lê coordenadas de textura (vt)
  - Processa faces trianguladas e poligonais
  - Gera normais automaticamente quando não disponíveis
  - Normaliza modelos para encaixar no viewport
  - Suporta índices negativos (referência relativa)

### 6. **Renderização com WebGL Puro**
- **Vertex Array Objects (VAO):** Gerenciamento eficiente de atributos de vértice.
- **Shaders em GLSL:** Vertex shader e fragment shader implementados desde zero para máximo controle.
- **Buffer Objects:** Utilização de VBO, EBO e texture buffers para armazenamento eficiente de dados.
- **Sem abstração gráfica:** Chamadas diretas ao WebGL, sem Three.js ou similares.

### 7. **Interação via Teclado e Mouse**
- **Captura de Eventos:** Sistema de input responsivo para movimentação (W/A/S/D ou Setas) e rotação de câmera (Mouse).
- **Delta Time:** Implementação de frame rate independente para movimento suave independente da taxa de frames.

---

## 📁 Arquitetura do Projeto

O projeto segue uma arquitetura limpa e modularizada, separando claramente o motor gráfico da lógica do jogo:

```
BedroomWindow/
│
├── index.html                 # Página de entrada e menu principal
├── main.html                  # Página do jogo 3D
│
├── css/                       # Estilos (não críticos para o jogo)
│   └── styles.css
│
├── assets/                    # Recursos do jogo
│   ├── audio/                 # Arquivos de música e efeitos sonoros
│   ├── textures/              # Imagens para mapeamento em 3D
│   ├── models/                # Arquivos OBJ dos modelos 3D
│   └── images/                # Imagens para interface/menu
│
└── src/                       # Código-fonte principal
    ├── main.js                # Ponto de entrada e loop principal do jogo
    │
    ├── utils/                 # 🔧 Utilitários
    │   ├── math.js            # Álgebra linear: vetores, matrizes 4x4, operações
    │   ├── webgl_utils.js     # Funções auxiliares para WebGL
    │   └── helpers.js         # Funções gerais de helper
    │
    ├── graphics/              # 🎨 MOTOR GRÁFICO (Pipeline Gráfico 3D)
    │   ├── renderer.js        # Gerenciador de renderização e estado WebGL
    │   ├── camera.js          # Sistema de câmera em primeira pessoa
    │   ├── mesh.js            # Classe Mesh (VAO, material, textura, renderização)
    │   ├── texture-loader.js  # Carregador de texturas para WebGL
    │   ├── room.js            # Construção manual da cena (geometria do quarto)
    │   ├── outside_scenario.js# Construção da cena externa (vista da janela)
    │   └── geometry_generator.js # Geração de primitivas geométricas
    │
    ├── models/                # 📦 MODELOS 3D
    │   ├── obj-loader.js      # Leitor próprio de arquivos OBJ
    │   ├── animations.js      # Definições de animações para objetos
    │   └── geometry.js        # Geometrias pré-definidas
    │
    ├── game/                  # 🎮 LÓGICA DO JOGO
    │   ├── game-loop.js       # Implementação do game loop
    │   └── game-state.js      # Controle de estado do jogo
    │
    ├── entities/              # 🎭 ENTIDADES DO JOGO
    │   ├── player.js          # Controle e estado do jogador
    │   └── interactive-objects.js # Objetos interativos da cena
    │
    ├── core/                  # ⚙️ NÚCLEO DO JOGO
    │   └── collision-system.js # Sistema simples de detecção de colisão
    │
    ├── menu_e_gameover/       # 📋 INTERFACE
    │   ├── menu.js            # Lógica do menu principal
    │   └── pause-menu.js      # Lógica do menu de pausa
    │
    └── audio/                 # 🔊 ÁUDIO
        └── audio-manager.js   # Gerenciamento de áudio e música
```

---

## 🚀 Como Executar o Projeto

Este projeto é desenvolvido inteiramente em HTML5, JavaScript e WebGL, funcionando em qualquer navegador moderno com suporte a WebGL 2.0.

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari) com suporte a WebGL 2.0
- Servidor web local (necessário para carregar arquivos via CORS)

### Passo a passo (Usando Live Server no VS Code)

1. **Clone ou extraia o repositório:**
   ```bash
   git clone https://github.com/GustavoAlexandreD/BedroomWindow.git
   cd BedroomWindow
   ```

2. **Abra no VS Code:**
   ```bash
   code .
   ```

3. **Instale a extensão Live Server** (caso não tenha):
   - Vá em Extensions (Ctrl+Shift+X)
   - Procure por "Live Server"
   - Clique em Install

4. **Inicie o servidor:**
   - Clique com botão direito em `index.html`
   - Selecione "Open with Live Server"
   - O navegador abrirá automaticamente em `http://localhost:5500`

5. **Navegue pelo menu:**
   - Clique em "INICIAR" para começar o jogo
   - Use TUTORIAL para aprender os controles
   - Use HISTÓRIA para conhecer o contexto do jogo

### Passo a passo (Usando Python)

Se preferir um servidor simples:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Depois acesse `http://localhost:8000` no navegador.

### Passo a passo (Usando Node.js)

```bash
# Instale http-server globalmente
npm install -g http-server

# Execute na pasta do projeto
http-server

# Acesse http://localhost:8080
```

---

## ⌨️ Controles

| Ação | Tecla(s) |
|------|----------|
| **Mover para frente** | W ou Seta ↑ |
| **Mover para trás** | S ou Seta ↓ |
| **Mover para esquerda** | A ou Seta ← |
| **Mover para direita** | D ou Seta → |
| **Rotacionar câmera** | Mouse (Mover) |
| **Interagir com objetos** | Mouse (Clique) |
| **Evento supresa** | F |
***OBS*** | A tecla  F proporciona um evento surpresa quando acionada próxima a cama do quarto final! |

---

## 🎯 Requisitos Atendidos

### ✅ Requisitos Gerais (Obrigatórios)

- **I) Movimentação de câmera com projeção perspectiva:**
  - Implementado em `src/graphics/camera.js` com primeira pessoa
  - Projeção perspectiva em `src/utils/math.js`

- **II) Sistema de iluminação com modelo de Phong:**
  - Implementado em shader (vertex e fragment)
  - Fonte de luz móvel que se desloca dinamicamente
  - Cálculo de ambient, diffuse e specular

- **III) Pelo menos um objeto animado:**
  - Objeto giram continuamente
  - Translação em trajetória

- **IV) Pelo menos um objeto com textura:**
  - Parede do quarto com textura mapeada
  - Objetos 3D carregados com texturas OBJ

- **V) Pelo menos um objeto com cor sólida:**
  - Paredes com cores sólidas
  - Objetos sem textura com material de cor única

- **VI) Desenho exclusivamente com WebGL ≥ 4.0:**
  - Sem Three.js ou bibliotecas gráficas de alto nível
  - Shaders GLSL puro

- **VII) Álgebra Linear (Math.js ou equivalent):**
  - `src/utils/math.js` implementa operações de álgebra linear
  - Matrizes 4x4, vetores, quaternions

- **VIII) Canvas HTML5 + Eventos de teclado/mouse:**
  - Canvas criado em `main.html`
  - Eventos capturados e processados

### ✅ Requisitos Específicos do Jogo 3D

- **I) Câmera livre em primeira pessoa:**
  - Implementado com yaw/pitch
  - Movimentação completa pelo ambiente

- **II) Objetos 3D carregados de arquivos OBJ:**
  - Modelos 3D importados via OBJ

- **III) Leitor próprio de OBJ:**
  - `src/models/obj-loader.js` implementa parser completo
  - Suporta vértices, normais, texturas e faces

- **IV) Modelos 3D gratuitos:**
  - Utilizados modelos de fontes públicas

- **V) Não obrigatório:** Modelos autorais não são necessários

---

## 📊 Estrutura de Requisitos vs Código

| Requisito | Arquivo | Status |
|-----------|---------|--------|
| Projeção Perspectiva | `src/utils/math.js` | ✅ |
| Câmera 1ª Pessoa | `src/graphics/camera.js` | ✅ |
| Iluminação Phong | Shaders em `src/graphics/renderer.js` | ✅ |
| Luz Dinâmica | `src/graphics/room.js` | ✅ |
| Objetos Animados | `src/models/animations.js` | ✅ |
| Texturas 3D | `src/graphics/texture-loader.js` | ✅ |
| Cores Sólidas | `src/graphics/room.js` | ✅ |
| WebGL Puro | `src/graphics/renderer.js` | ✅ |
| Leitor OBJ | `src/models/obj-loader.js` | ✅ |
| Input Teclado/Mouse | `src/main.js` | ✅ |
| Colisão | `src/core/collision-system.js` | ✅ |

---

## 👥 Equipe

- **Ramon Venâncio** - ramon.venancio@aluno.uece.br
- **Helen Braga** - helen.alves@aluno.uece.br
- **Gustavo Alexandre** - gustavo.alexandre@aluno.uece.br

---

## 📸 Screenshots

[Adicionar screenshots do jogo aqui]

---

## 🎬 Vídeo de Demonstração

[Link para vídeo demonstrando a execução do programa]

---

## 📖 Slides da Apresentação

[Link para slides do projeto]

---

## 📝 Notas Técnicas

### Tecnologias Utilizadas
- **JavaScript ES6+** - Linguagem principal
- **WebGL 2.0** - API gráfica pura
- **HTML5 Canvas** - Contexto gráfico
- **GLSL** - Linguagem de shader

### Bibliotecas Permitidas
- Álgebra Linear: `math.js` customizado
- Eventos: API nativa do navegador
- Nenhuma biblioteca gráfica de alto nível

---

## 📋 Licença

Este projeto foi desenvolvido como atividade acadêmica para a disciplina de Computação Gráfica.

