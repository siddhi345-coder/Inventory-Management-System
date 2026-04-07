import pandas as pd
from utils.db import execute_query


SALES_QUERY = """
    SELECT
        s.id                                        AS sale_id,
        s.sale_date,
        COALESCE(c.name, 'Walk-in')                 AS customer_name,
        p.name                                      AS product_name,
        p.brand,
        p.category,
        si.quantity,
        si.price                                    AS unit_price,
        (si.quantity * si.price)                    AS line_total,
        s.total_amount                              AS sale_total,
        COALESCE(u.name, 'Unknown')                 AS staff_name,
        COALESCE(s.status, 'completed')             AS status
    FROM sales s
    LEFT JOIN customers  c  ON s.customer_id = c.id
    LEFT JOIN users      u  ON s.created_by  = u.id
    LEFT JOIN sales_items si ON s.id         = si.sale_id
    LEFT JOIN products   p  ON si.product_id = p.id
    ORDER BY s.sale_date DESC
"""


def get_sales_data() -> list[dict]:
    """
    Fetch all sales records joined with customer, staff, product info.
    Returns a list of dicts ready for JSON / file generation.
    """
    rows = execute_query(SALES_QUERY)

    if not rows:
        return []

    df = pd.DataFrame(rows)

    # Ensure numeric types
    df["quantity"]   = pd.to_numeric(df["quantity"],   errors="coerce").fillna(0).astype(int)
    df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0).astype(float)
    df["line_total"] = pd.to_numeric(df["line_total"], errors="coerce").fillna(0).astype(float)
    df["sale_total"] = pd.to_numeric(df["sale_total"], errors="coerce").fillna(0).astype(float)

    # Normalise date to ISO string for JSON serialisation
    df["sale_date"] = pd.to_datetime(df["sale_date"]).dt.strftime("%Y-%m-%d %H:%M:%S")

    return df.to_dict(orient="records")


def get_sales_summary() -> dict:
    """Return high-level summary statistics for the sales data."""
    rows = get_sales_data()
    if not rows:
        return {
            "total_orders": 0,
            "total_items_sold": 0,
            "total_revenue": 0.0,
            "average_order_value": 0.0,
        }

    df = pd.DataFrame(rows)
    unique_orders = df["sale_id"].nunique()
    total_items   = int(df["quantity"].sum())
    total_revenue = round(float(df["line_total"].sum()), 2)
    avg_order     = round(float(df.groupby("sale_id")["line_total"].sum().mean()), 2)

    return {
        "total_orders":        unique_orders,
        "total_items_sold":    total_items,
        "total_revenue":       total_revenue,
        "average_order_value": avg_order,
    }
