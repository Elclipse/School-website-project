const nav = document.querySelector('.muc_dieu_huong');
const links = nav.querySelectorAll('a');
const indicator = nav.querySelector('.indicator');

function moveIndicator(link) {
    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    const extraPadding = 16; // mỗi bên 16px → nút dài hơn chữ

    indicator.textContent = link.textContent;
    indicator.style.opacity = '1';
    indicator.style.width = (linkRect.width + extraPadding * 2) + 'px';

    // ép reflow để tránh khựng
    indicator.getBoundingClientRect();

    indicator.style.left =
        (linkRect.left - navRect.left - extraPadding) + 'px';
}

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault(); // tránh nhảy trang trước
            moveIndicator(link);

            // scroll mượt
            const id = link.getAttribute('href');
            const target = document.querySelector(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

/* Scroll */
window.addEventListener('scroll', () => {
    let current = links[0];
    links.forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section && section.getBoundingClientRect().top <= 120) {
            current = link;
        }
    });
    moveIndicator(current);
});

    // active mục đầu khi load
    moveIndicator(links[0]);

const hoaContainer = document.querySelector('.hoa_roi');

// Hoa mai 🌼 + sen 🌸
const hoaList = ['🌼', '🌸', '🧧', '🐎', '🏮'];

function taoHoa() {
    const hoa = document.createElement('div');
    hoa.classList.add('hoa');
    hoa.textContent = hoaList[Math.floor(Math.random() * hoaList.length)];

    const size = Math.random() * 20 + 20;
    hoa.style.fontSize = size + 'px';

    hoa.style.left = Math.random() * 100 + 'vw';

    const duration = Math.random() * 6 + 6;
    hoa.style.animationDuration = duration + 's';

    hoaContainer.appendChild(hoa);

    // Xóa khi rơi xong
    setTimeout(() => {
        hoa.remove();
    }, duration * 1000);
}

// Tạo hoa liên tục
setInterval(taoHoa, 500);

// Tính năng lưu Góp ý bằng Cloudflare API
const formGopY = document.getElementById('form_gopy_kinh_nghiem');
const danhSachGopYContainer = document.getElementById('danh_sach_gop_y');
const popupCamOn = document.getElementById('popup_cam_on');
const dongPopupBtn = document.getElementById('dong_popup');

// URL API Cloudflare Worker (BẠN CẦN THAY BẰNG URL WORKER CỦA BẠN KHI DEPLOY)
const WORKER_API_URL = 'https://tet-api.your-username.workers.dev/api/gopy';

// Hàm tải danh sách góp ý từ Cloudflare (API)
async function taiDanhSachGopY() {
    if (!danhSachGopYContainer) return;
    
    try {
        const response = await fetch(WORKER_API_URL);
        if (!response.ok) throw new Error('API Error');
        const gopYData = await response.json();
        
        danhSachGopYContainer.innerHTML = '';
        if (!gopYData || gopYData.length === 0) {
            danhSachGopYContainer.innerHTML = '<p style="text-align: center; color: #888;">Chưa có góp ý nào. Hãy là người đầu tiên!</p>';
            return;
        }
        
        // Render dữ liệu mới nhất lên đầu 
        gopYData.reverse().forEach(item => {
            const div = document.createElement('div');
            div.className = 'gop_y_item';
            div.innerHTML = `
                <h4>${item.ten}</h4>
                <p>${item.noidung}</p>
                <span class="thoi_gian">${item.thoigian}</span>
            `;
            danhSachGopYContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu Cloud:", error);
        danhSachGopYContainer.innerHTML = '<p style="text-align: center; color: #888;">Góp ý sẽ được kết nối với Cloudflare KV khi bạn cung cấp Worker API.</p>';
    }
}

// Lắng nghe sự kiện submit form
if (formGopY) {
    formGopY.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const tenUser = document.getElementById('ten_user').value.trim();
        const noiDung = document.getElementById('noi_dung').value.trim();
        
        if (tenUser && noiDung) {
            const newGopY = {
                ten: tenUser,
                noidung: noiDung,
                thoigian: new Date().toLocaleString('vi-VN')
            };
            
            try {
                // Gửi qua Cloudflare Worker API
                await fetch(WORKER_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newGopY)
                });
            } catch (error) {
                console.error("Demo Mode, chưa kết nối:", error);
            }
            
            // Hiện popup cảm ơn thay vì chuyển trang
            if (popupCamOn) {
                popupCamOn.style.display = 'flex';
            }
            
            taiDanhSachGopY();
            formGopY.reset();
        }
    });
}

// Đóng popup
if (dongPopupBtn) {
    dongPopupBtn.addEventListener('click', () => {
        popupCamOn.style.display = 'none';
    });
}

// Render dữ liệu khi trang tải
taiDanhSachGopY();
