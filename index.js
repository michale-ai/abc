const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Render 절전 방지용 핑 엔드포인트
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// 메인 프록시 로직
app.get('/', async (req, res) => {
  const assetId = req.query.id; // Cloudflare의 url.searchParams.get("id")와 동일

  // 1. ID 파라미터가 없으면 에러 반환
  if (!assetId) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  // 2. 로블록스 카탈로그 API 주소
  const robloxUrl = `https://catalog.roblox.com/v1/assets/${assetId}/bundles`;

  try {
    // 3. 로블록스 서버로 요청 전송 (Node.js 18+ 내장 fetch 사용)
    const response = await fetch(robloxUrl, {
      headers: {
        'User-Agent': 'RobloxGameServer/1.0',
        'Accept': 'application/json'
      }
    });

    // 4. 결과를 텍스트로 변환
    const data = await response.text();

    // 5. 로블록스 게임 서버로 결과 반환
    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    
    // 상태 코드와 데이터 전송
    res.status(response.status).send(data);

  } catch (err) {
    // 6. 실패 시 에러 반환
    console.error(err);
    res.status(500).json({ error: "Proxy Fetch Failed", details: err.toString() });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});