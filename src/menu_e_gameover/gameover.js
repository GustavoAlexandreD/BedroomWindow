const GAME_OVER_STORAGE_KEY = "bedroom-window:game-over-data";

/**
 * Guarda dados para a tela de game over e redireciona.
 * Futuramente pode receber contador, score e outros campos.
 */
export function irParaGameOver(data = {}) {
    const payload = {
        timestamp: Date.now(),
        ...data
    };

    try {
        sessionStorage.setItem(GAME_OVER_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn("Não foi possível salvar dados de game over:", error);
    }

    if (typeof window !== "undefined") {
        window.location.href = "gameOver.html";
    }
}

export function lerDadosGameOver() {
    try {
        const raw = sessionStorage.getItem(GAME_OVER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn("Não foi possível ler dados de game over:", error);
        return null;
    }
}

export function limparDadosGameOver() {
    try {
        sessionStorage.removeItem(GAME_OVER_STORAGE_KEY);
    } catch (error) {
        console.warn("Não foi possível limpar dados de game over:", error);
    }
}
