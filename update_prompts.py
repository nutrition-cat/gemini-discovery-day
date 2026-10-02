# -*- coding: utf-8 -*-
"""
update_prompts.py
チームメンバーから渡された新しいTSVファイルから、サイト用の prompts-data.js を再生成するスクリプト。

使用方法:
  python update_prompts.py
  （または別のTSVを指定する場合: python update_prompts.py my_new_prompts.tsv）
"""

import sys
import os
import json

tsv_file = sys.argv[1] if len(sys.argv) > 1 else '80prompt.tsv'

if not os.path.exists(tsv_file):
    print(f"エラー: {tsv_file} が見つかりません。")
    sys.exit(1)

# build_prompts_data.py のロジックを実行
print(f"TSVファイル '{tsv_file}' を読み込んで site/prompts-data.js を更新します...")
os.system(f"python build_prompts_data.py")
print("更新が完了しました！ブラウザをリロードすると最新のプロンプトが反映されます。")
