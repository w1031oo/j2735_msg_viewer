# scripts/decode_uper.py
import asn1tools
import sys
import json
import os

try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    asn_dir = os.path.join(script_dir, 'asn')
    
    # MAP에 필요한 최소 파일만
    asn_files = [
        os.path.join(asn_dir, 'J2735-Common-2024-rel-v1.1.2.asn'),  # 수정된 파일
        os.path.join(asn_dir, 'J2735-MapData-2024-rel-v1.1.asn'),
        os.path.join(asn_dir, 'J2735-REGION-2024-rel-v1.1.asn'),
        os.path.join(asn_dir, 'J2735-BasicSafetyMessage-2024-rel-v1.1.2.asn'),
        os.path.join(asn_dir, 'J2735-ITIS-2024-rel-v1.1.asn')
    ]
    
    j2735 = asn1tools.compile_files(asn_files, 'uper')
    
    hex_data = sys.argv[1]
    result = j2735.decode('MapData', bytes.fromhex(hex_data))
    
    print(json.dumps(result, indent=2, default=str))
    
except Exception as e:
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)