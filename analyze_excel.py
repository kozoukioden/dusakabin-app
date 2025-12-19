import pandas as pd
import openpyxl

file_path = 'İmalatFisi(bitmiş olan).xlsx'

try:
    # Read values
    df = pd.read_excel(file_path, engine='openpyxl')
    print("=== EXCEL VALUES SAMPLE ===")
    print(df.head(20).to_string())
    
    # Read formulas
    wb = openpyxl.load_workbook(file_path, data_only=False)
    sheet = wb.active
    print(f"\n=== FORMULAS IN SHEET: {sheet.title} ===")
    for row in sheet.iter_rows(min_row=1, max_row=20, min_col=1, max_col=10):
        row_data = []
        for cell in row:
            val = cell.value
            # distinct formulas usually start with =
            if isinstance(val, str) and val.startswith('='):
                row_data.append(f"FORMULA: {val}")
            else:
                row_data.append(val)
        print(row_data)

except Exception as e:
    print(f"Error: {e}")
