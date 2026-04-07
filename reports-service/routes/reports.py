import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse

from services.report_service import get_sales_data, get_sales_summary
from utils.excel import generate_sales_excel
from utils.pdf import generate_sales_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])


# ── GET /reports/sales ────────────────────────────────────────────────────────
@router.get("/sales", summary="Get sales data as JSON")
def sales_json(
    limit: int = Query(default=None, ge=1, description="Limit number of records returned"),
):
    """
    Returns all sales records as a JSON array.
    Each record includes sale ID, date, customer, product, quantity, price and staff.
    Optionally pass ?limit=N to cap the number of rows.
    """
    try:
        data = get_sales_data()
        summary = get_sales_summary()

        if limit:
            data = data[:limit]

        return JSONResponse(content={
            "success": True,
            "summary": summary,
            "count": len(data),
            "data": data,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sales data: {str(e)}")


# ── GET /reports/sales/excel ──────────────────────────────────────────────────
@router.get("/sales/excel", summary="Download sales report as Excel")
def sales_excel():
    """
    Generates and returns a formatted .xlsx Excel file containing all sales data.
    The file is returned as a downloadable attachment.
    """
    try:
        data = get_sales_data()
        file_path = generate_sales_excel(data)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="Excel file generation failed")

        return FileResponse(
            path=file_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="sales_report.xlsx",
            headers={"Content-Disposition": "attachment; filename=sales_report.xlsx"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation error: {str(e)}")


# ── GET /reports/sales/pdf ────────────────────────────────────────────────────
@router.get("/reports/sales/pdf", summary="Download sales report as PDF", include_in_schema=False)
@router.get("/sales/pdf", summary="Download sales report as PDF")
def sales_pdf():
    """
    Generates and returns a formatted A4-landscape PDF report of all sales data.
    Includes a summary section and a detailed line-item table.
    The file is returned as a downloadable attachment.
    """
    try:
        data = get_sales_data()
        file_path = generate_sales_pdf(data)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="PDF file generation failed")

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename="sales_report.pdf",
            headers={"Content-Disposition": "attachment; filename=sales_report.pdf"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
