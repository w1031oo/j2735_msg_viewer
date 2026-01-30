import asn1tools
import os
import json

# 1. ASN.1 파일들이 들어있는 디렉토리 경로
asn_dir = './asn_files'  # 파일들이 위치한 폴더명으로 변경하세요.

# 2. 해당 폴더의 모든 .asn 파일 경로 리스트 생성
asn_files = [os.path.join(asn_dir, f) for f in os.listdir(asn_dir) if f.endswith('.asn')]

# 3. 모든 파일을 한꺼번에 컴파일 (UPER 방식 지정)
# J2735는 보통 'MessageFrame'이 최상위 구조체(PDU)입니다.
try:
    foo = asn1tools.compile_files(asn_files, 'uper')
    print("✅ 모든 ASN.1 스키마가 성공적으로 로드되었습니다.")
except Exception as e:
    print(f"❌ 스키마 로드 실패: {e}")

# 4. MAP UPER 데이터 디코딩 함수
def decode_j2735_map(hex_string):
    try:
        binary_data = bytes.fromhex(hex_string)
        
        # J2735 메시지는 대부분 MessageFrame이라는 껍데기에 싸여 있습니다.
        decoded = foo.decode('MessageFrame', binary_data)
        
        return decoded
    except Exception as e:
        return {"error": str(e)}

# 테스트용 Hex 데이터 (실제 데이터로 교체하세요)
test_uper = "0012..." 
result = decode_j2735_map(test_uper)
print(json.dumps(result, indent=2))