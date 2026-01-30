import glob
import json
import os
import sys
import asn1tools

# 1. bytes 타입을 JSON이 이해할 수 있는 hex 문자열로 변환하는 클래스 (필수!)
class BytesEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, bytes):
            return obj.hex().upper()  # 바이트 데이터를 "00A1..." 형태의 Hex로 변환
        return super(BytesEncoder, self).default(obj)

def decode_uper(hex_string):
    base_path = os.path.dirname(os.path.abspath(__file__))
    asn_dir = os.path.join(base_path, 'asn_files')
    
    # 확장자 대소문자 구분 없이 모든 .asn 파일 수집
    asn_files = [
        os.path.join(asn_dir, f) 
        for f in os.listdir(asn_dir) 
        if f.lower().endswith('.asn')
    ]
    
    if not asn_files:
        print(json.dumps({"error": f"ASN files not found in {asn_dir}"}))
        return
    
    # 2. 모든 파일의 내용을 하나로 합치기 (의존성 에러 해결용)
    combined_asn = ""
    for filepath in asn_files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                combined_asn += f.read() + "\n"
        except Exception as e:
            continue
            
    try:
        # 3. 중요: compile_files 대신 compile_string 사용
        # 문자열 덩어리를 넘길 때는 compile_string을 써야 합니다.
        codec = asn1tools.compile_string(combined_asn, 'uper')
        
        # hex -> bytes 변환
        binary_data = bytes.fromhex(hex_string)
        
        # MessageFrame decode
        decoded = codec.decode('MessageFrame', binary_data)
        
        # 만약 내부 value가 아직 풀리지 않은 Hex/Bytes라면 다시 한번 풉니다.
        msg_id = decoded.get('messageId')
        msg_value = decoded.get('value')

        # 18 == MapData
        if msg_id == 18 and isinstance(msg_value, (bytes, str)):
            # 만약 문자열(Hex)로 들어왔다면 bytes로 변환
            inner_bytes = bytes.fromhex(msg_value) if isinstance(msg_value, str) else msg_value
            # MapData 타입으로 재디코딩
            decoded['value'] = codec.decode('MapData', inner_bytes)
        # 19 == SPAT    
        elif msg_id == 19 and isinstance(msg_value, (bytes, str)):
            inner_bytes = bytes.fromhex(msg_value) if isinstance(msg_value, str) else msg_value
            decoded['value'] = codec.decode('SPAT', inner_bytes)

        # 최종 결과 출력
        print(json.dumps(decoded, cls=BytesEncoder, ensure_ascii=False))
        
    except Exception as e:
        # 에러 발생 시 순수 JSON으로만 출력 (앞에 텍스트 붙이지 말 것)
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        decode_uper(sys.argv[1])
    else:
        print(json.dumps({"error": "No input hex data provided"}))