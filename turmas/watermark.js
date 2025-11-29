document.addEventListener("DOMContentLoaded", () => {
    // Criar elemento <a> ao invés de <div> para ser clicável
    const watermark = document.createElement("a");
    watermark.className = "nandev-watermark";

    // COLOQUE AQUI O LINK DO SEU PORTFÓLIO
    watermark.href = "https://nansinyx26.github.io/Portifolio-2026-Renan-Farias/"; // ⬅️ ALTERE AQUI
    watermark.target = "_blank"; // Abre em nova aba
    watermark.rel = "noopener noreferrer"; // Segurança
    watermark.title = "Visite meu portfólio"; // Tooltip ao passar o mouse

    watermark.innerHTML = `
        <div class="cube-container">
            <div class="wireframe-cube">
                <div class="cube-face front"></div>
                <div class="cube-face back"></div>
                <div class="cube-face right"></div>
                <div class="cube-face left"></div>
                <div class="cube-face top"></div>
                <div class="cube-face bottom"></div>

                <div class="wireframe-lines">
                    <div class="inner-line horizontal-line line-1"></div>
                    <div class="inner-line horizontal-line line-2"></div>
                    <div class="inner-line horizontal-line line-3"></div>
                    <div class="inner-line vertical-line v-line-1"></div>
                    <div class="inner-line vertical-line v-line-2"></div>
                    <div class="inner-line vertical-line v-line-3"></div>
                </div>
            </div>
        </div>

        <span class="watermark-text">
            Desenvolvido por 
            <span class="watermark-highlight">NanDev</span>
            <span class="code-symbol">&lt;/&gt;</span>
        </span>

        <div class="geometric-particles">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>

        <div class="holographic-overlay"></div>
    `;

    document.body.appendChild(watermark);

    // Scroll effect - agora dentro do DOMContentLoaded
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // DESCENDO → ESCONDE (mas só após rolar 100px)
            watermark.style.opacity = '0';
            watermark.style.transform = 'translateX(-50%) translateY(20px)';
        } else {
            // SUBINDO → MOSTRA
            watermark.style.opacity = '1';
            watermark.style.transform = 'translateX(-50%) translateY(0)';
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    console.log('✅ Watermark NanDev carregado com sucesso!');
});