/**
 * CLOUDFLARE WORKER - XỬ LÝ GÓP Ý
 *  
 * Hướng dẫn deploy Cloudflare Worker:
 * 1. Đăng nhập Cloudflare Dashboard -> Tới phần Workers & Pages -> Nhấn Create -> Create Worker.
 * 2. Đặt tên là `tet-api` (hoặc tên tùy thích) và deploy.
 * 3. Chuyển sang phần "KV" ở menu bên trái -> Tới Create a namespace -> Nhập tên là `TET_FEEDBACKS`.
 * 4. Vào lại Worker `tet-api` -> Settings -> Variables -> KV Namespace Bindings:
 *      + Variable name: TET_FEEDBACKS
 *      + KV namespace: TET_FEEDBACKS (chọn cái bạn vừa tạo ở bước 3)
 * 5. Chọn Edit Code ở góc phải trên cùng màn hình. Dán toàn bộ mã nguồn bên dưới vào file worker.js rồi nhấn Save and Deploy.
 * 6. Copy URL API của worker (định dạng `https://tet-api.xxx.workers.dev`) và dán vào thay thế biến `WORKER_API_URL` ở trong file `script.js` dòng 86 + thêm đuôi `/api/gopy`.
 */

export default {
    async fetch(request, env) {
        // Cấu hình CORS cho phép mọi domain (hoặc domain web của bạn)
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Xử lý request Preflight (OPTIONS)
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // API Endpoint góp ý
        if (url.pathname === '/api/gopy') {
            try {
                // Lấy dữ liệu cũ từ Cloudflare KV
                let feedbacks = [];
                const stored = await env.TET_FEEDBACKS.get('gopy_list');
                if (stored) {
                    feedbacks = JSON.parse(stored);
                }

                // Xử lý Lấy danh sách (GET)
                if (request.method === 'GET') {
                    return new Response(JSON.stringify(feedbacks), {
                        headers: { 
                            ...corsHeaders, 
                            'Content-Type': 'application/json' 
                        },
                    });
                }

                // Xử lý Gửi góp ý (POST)
                if (request.method === 'POST') {
                    const body = await request.json();
                    
                    // Thêm góp ý mới vào mảng
                    feedbacks.push(body);
                    
                    // Lưu lại thay đổi vào Cloudflare KV
                    await env.TET_FEEDBACKS.put('gopy_list', JSON.stringify(feedbacks));
                    
                    return new Response(JSON.stringify({ success: true }), {
                        headers: { 
                            ...corsHeaders, 
                            'Content-Type': 'application/json' 
                        },
                    });
                }
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
            }
        }

        // 404
        return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
    }
};
