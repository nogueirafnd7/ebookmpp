document.addEventListener('DOMContentLoaded', function () {
    // Controle do sidebar
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('overlay');

    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
            document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Links do sumário
    const sidebarLinks = document.querySelectorAll('.sidebar-list a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }

            // Em mobile, fecha o sidebar após clicar em um link
            if (window.innerWidth < 992) {
                if (sidebar) sidebar.classList.remove('show');
                if (overlay) overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });

    // Botão de voltar ao topo
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function () {
            // Mostrar/ocultar botão de voltar ao topo
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }

            // Atualizar barra de progresso
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                const winHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;
                const scrollTop = window.scrollY;
                const progress = (scrollTop / (docHeight - winHeight)) * 100;
                progressBar.style.width = progress + '%';
            }

            // Atualizar link ativo no sumário
            const sections = document.querySelectorAll('.ebook-page');
            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (scrollY >= sectionTop) {
                    currentSection = section.getAttribute('id');
                }
            });

            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Botão de começar a leitura
    const startReadingBtn = document.getElementById('startReading');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', function () {
            const page1 = document.getElementById('page1');
            if (page1) {
                page1.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Download do PDF
    const downloadPdfBtn = document.getElementById('downloadPdf');
    if (downloadPdfBtn && typeof html2pdf !== 'undefined') {
        downloadPdfBtn.addEventListener('click', function () {
            // Desativar o botão temporariamente para evitar múltiplos cliques
            downloadPdfBtn.disabled = true;
            downloadPdfBtn.innerHTML = '<i class="bi bi-hourglass"></i> Gerando PDF...';

            // Clonar o elemento para manipulação
            const content = document.querySelector('.main-content').cloneNode(true);

            // Forçar A4 no clone (sem depender só do @media print)
            content.querySelectorAll('.ebook-page').forEach(page => {
                page.style.width = "210mm";
                page.style.height = "297mm";
                page.style.margin = "0";
                page.style.borderRadius = "0";
                page.style.boxShadow = "none";
                page.style.pageBreakAfter = "always";
            });

            // Remover elementos interativos
            content.querySelectorAll('.page-navigation, #startReading, .navbar-toggler, .back-to-top, .progress-container').forEach(el => el.remove());

            // Configurações para o PDF
            const options = {
                margin: 0,
                filename: 'padrao-observer-ebook.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };



            // Gerar o PDF
            html2pdf().set(options).from(content).save().then(() => {
                // Reativar o botão após a geração
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.innerHTML = '<i class="bi bi-download"></i> Baixar PDF';
            }).catch(error => {
                console.error('Erro ao gerar PDF:', error);
                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.innerHTML = '<i class="bi bi-download"></i> Baixar PDF';
            });
        });
    } else if (downloadPdfBtn) {
        console.error('html2pdf não está carregado corretamente');
        downloadPdfBtn.disabled = true;
        downloadPdfBtn.innerHTML = '<i class="bi bi-x-circle"></i> Erro: Biblioteca não carregada';
    }

    // Navegação por teclado
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') {
            // Próxima página
            const currentPage = getCurrentPage();
            if (currentPage && currentPage.nextElementSibling) {
                currentPage.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (e.key === 'ArrowLeft') {
            // Página anterior
            const currentPage = getCurrentPage();
            if (currentPage && currentPage.previousElementSibling) {
                currentPage.previousElementSibling.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    function getCurrentPage() {
        const sections = document.querySelectorAll('.ebook-page');
        let currentSection = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                currentSection = section;
            }
        });

        return currentSection;
    }

    // Ajustar altura das páginas para visualização web
    function adjustPageHeights() {
        if (window.innerWidth >= 992) {
            const pages = document.querySelectorAll('.ebook-page:not(.cover-page)');
            pages.forEach(page => {
                page.style.minHeight = 'auto';
            });
        } else {
            const pages = document.querySelectorAll('.ebook-page:not(.cover-page)');
            pages.forEach(page => {
                page.style.minHeight = '297mm';
            });
        }
    }

    // Ajustar inicialmente e ao redimensionar a janela
    adjustPageHeights();
    window.addEventListener('resize', adjustPageHeights);
});