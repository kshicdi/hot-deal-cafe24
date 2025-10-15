// 직접 상품 생성 테스트 (OAuth 인증 건너뛰기)
const axios = require('axios');

async function testProductCreation() {
  console.log('🧪 직접 상품 생성 테스트 시작...');
  
  // 실제 액세스 토큰이 필요합니다
  const accessToken = 'YOUR_ACCESS_TOKEN_HERE';
  
  const productData = {
    shop_no: 1,
    request: {
      product: {
        product_name: '테스트 상품 - 직접 생성',
        product_name_eng: 'Direct Test Product',
        price: 15000,
        retail_price: 20000,
        supply_price: 10000,
        display: 'T',
        selling: 'T',
        product_condition: 'NEW',
        summary_description: '직접 API 호출로 생성한 테스트 상품입니다.',
        product_tag: '테스트,직접생성,핫딜',
        tax_calculation: 'TAX',
        tax_save: 'T',
        origin_place_value: 'KOREA',
        category: {
          category_no: [1]
        }
      }
    }
  };
  
  try {
    const response = await axios.post(
      'https://smartg9001.cafe24api.com/api/v2/admin/products',
      productData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2022-03-01'
        }
      }
    );
    
    console.log('✅ 상품 생성 성공!');
    console.log('응답:', response.data);
    
  } catch (error) {
    console.error('❌ 상품 생성 실패:');
    console.error('상태:', error.response?.status);
    console.error('오류:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 해결 방법:');
      console.log('1. OAuth 인증을 통해 유효한 액세스 토큰을 받아야 합니다');
      console.log('2. 또는 Vercel에 배포하여 HTTPS 환경에서 테스트하세요');
    }
  }
}

testProductCreation();
