# ml-etl/generate_report.py

#!/usr/bin/env python
import sys
import json
import os
from datetime import datetime
import tempfile

import pandas as pd
import matplotlib
matplotlib.use("Agg")  # headless backend
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# ---------- Helpers ----------
def ensure_dirs(paths):
    for p in paths:
        os.makedirs(p, exist_ok=True)

def save_chart(fig, out_path):
    fig.savefig(out_path, bbox_inches="tight", dpi=150)
    plt.close(fig)

def bar_chart_from_series(series, title, xlabel=None, ylabel="Average Salary", rotate_x=False):
    fig, ax = plt.subplots(figsize=(8, 4.5))
    series_sorted = series.sort_values(ascending=False)
    series_sorted.plot(kind="bar", ax=ax)
    ax.set_title(title, fontsize=12)
    if xlabel:
        ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    if rotate_x:
        plt.setp(ax.get_xticklabels(), rotation=30, ha='right')
    plt.tight_layout()
    return fig

# ---------- Trend computations ----------
def avg_by_column(df, col):
    # if col exists as single string column (categories)
    if col in df.columns:
        grouped = df.groupby(col)["Salary"].mean().round(2)
        return grouped
    # otherwise return empty Series
    return pd.Series([], dtype=float)

def avg_by_boolean_columns(df, columns_map):
    # columns_map: {"Label":"ColumnNameInCSV", ...}
    sums = {}
    counts = {}
    for label, col in columns_map.items():
        if col in df.columns:
            mask = df[col].astype(float) == 1
            vals = df.loc[mask, "Salary"].dropna().astype(float)
            if len(vals) > 0:
                sums[label] = vals.mean().round(2)
    if not sums:
        return pd.Series([], dtype=float)
    return pd.Series(sums)

def avg_by_experience(df, years_col="YearsCodePro"):
    if years_col not in df.columns:
        return pd.Series([], dtype=float)
    # convert to numeric where possible
    ser = pd.to_numeric(df[years_col], errors="coerce").dropna().astype(int)
    df2 = df.loc[ser.index].copy()
    df2[years_col] = ser
    grouped = df2.groupby(years_col)["Salary"].mean().round(2)
    return grouped

# ---------- PDF composition ----------
def compose_pdf(output_path, summary_lines, chart_paths, tables):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    margin = 25

    # Cover page
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, height - margin - 10, "Developer Salary Trends Report")
    c.setFont("Helvetica", 10)
    c.drawString(margin, height - margin - 30, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, height - margin - 60, "Summary Insights")
    y = height - margin - 80
    c.setFont("Helvetica", 10)
    for line in summary_lines:
        if y < 60:
            c.showPage()
            y = height - margin - 20
        c.drawString(margin + 10, y, f"- {line}")
        y -= 14

    c.showPage()

    # Charts: each chart on its own page
    for title, img_path in chart_paths:
        c.setFont("Helvetica-Bold", 14)
        c.drawString(margin, height - margin - 10, title)
        # fit image into page area
        img = ImageReader(img_path)
        img_width, img_height = img.getSize()
        max_w = width - 2 * margin
        max_h = height - 2 * margin - 30
        # compute scale
        scale = min(max_w / img_width, max_h / img_height, 1.0)
        disp_w = img_width * scale
        disp_h = img_height * scale
        x = (width - disp_w) / 2
        y = (height - disp_h) / 2 - 20
        c.drawImage(img, x, y, width=disp_w, height=disp_h)
        c.showPage()

    # Tables: write simple tables (text)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin, height - margin - 10, "Trend Tables")
    y = height - margin - 40
    c.setFont("Helvetica", 10)
    for title, rows in tables.items():
        if y < 80:
            c.showPage()
            y = height - margin - 20
        c.setFont("Helvetica-Bold", 12)
        c.drawString(margin, y, title)
        y -= 18
        c.setFont("Helvetica", 10)
        for r in rows:
            text = f"{r['label']}: ${r['avgSalary']}"
            if y < 60:
                c.showPage()
                y = height - margin - 20
            c.drawString(margin + 10, y, text)
            y -= 14
        y -= 8

    c.save()

# ---------- Main ----------
def main():
    # Paths
    base_dir = os.path.dirname(__file__)
    uploads_dir = os.path.join(base_dir, "uploads")
    ensure_dirs([uploads_dir])
    csv_path = os.path.join(uploads_dir, "dataset.csv")
    pdf_path = os.path.join(uploads_dir, "salary-report.pdf")
    tmp_dir = tempfile.mkdtemp(prefix="report_")

    if not os.path.exists(csv_path):
        out = {"success": False, "error": "Dataset not found at ml-etl/uploads/dataset.csv"}
        print(json.dumps(out))
        sys.exit(1)

    # Load CSV
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to read CSV: {str(e)}"}))
        sys.exit(1)

    # Ensure Salary numeric
    df["Salary"] = pd.to_numeric(df.get("Salary", pd.Series()), errors="coerce")

    # Compute trends based on common columns in your dataset
    charts = []
    tables = {}
    summary_lines = []

    # Org Size (categorical column 'OrgSize' expected)
    org_series = avg_by_column(df, "OrgSize")
    if not org_series.empty:
        fig = bar_chart_from_series(org_series, "Average Salary by Organization Size", xlabel="Org Size", rotate_x=True)
        org_chart = os.path.join(tmp_dir, "org_size.png")
        save_chart(fig, org_chart)
        charts.append(("Average Salary by Organization Size", org_chart))
        tables["Average Salary by Org Size"] = [{"label": idx, "avgSalary": float(v)} for idx, v in org_series.items()]
        top = org_series.idxmax()
        summary_lines.append(f"In OrgSize, {top} has highest average salary: ${org_series.max():,.2f}")

    # Region: try boolean region columns or a 'Region' column
    region_cols = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"]
    region_map = {}
    has_region_bool = any(c in df.columns for c in region_cols)
    if has_region_bool:
        for region in region_cols:
            if region in df.columns:
                mask = pd.to_numeric(df[region], errors="coerce") == 1
                vals = df.loc[mask, "Salary"].dropna().astype(float)
                if len(vals) > 0:
                    region_map[region] = vals.mean().round(2)
        if region_map:
            region_series = pd.Series(region_map)
            fig = bar_chart_from_series(region_series, "Average Salary by Region", xlabel="Region", rotate_x=True)
            region_chart = os.path.join(tmp_dir, "region.png")
            save_chart(fig, region_chart)
            charts.append(("Average Salary by Region", region_chart))
            tables["Average Salary by Region"] = [{"label": k, "avgSalary": float(v)} for k, v in region_map.items()]
            top = region_series.idxmax()
            summary_lines.append(f"Region with highest average salary: {top} (${region_series.max():,.2f})")
    else:
        # fallback: try 'Region' column
        region_series = avg_by_column(df, "Region")
        if not region_series.empty:
            fig = bar_chart_from_series(region_series, "Average Salary by Region", xlabel="Region", rotate_x=True)
            region_chart = os.path.join(tmp_dir, "region.png")
            save_chart(fig, region_chart)
            charts.append(("Average Salary by Region", region_chart))
            tables["Average Salary by Region"] = [{"label": idx, "avgSalary": float(v)} for idx, v in region_series.items()]
            top = region_series.idxmax()
            summary_lines.append(f"Region with highest average salary: {top} (${region_series.max():,.2f})")

    # Work mode: boolean columns Remote, Hybrid, In-person OR column 'WorkLocation'
    work_map = {}
    work_cols = {"Remote": "Remote", "Hybrid": "Hybrid", "In-person": "In-person"}
    has_work_bool = any(c in df.columns for c in work_cols.values())
    if has_work_bool:
        for label, col in work_cols.items():
            if col in df.columns:
                vals = df.loc[pd.to_numeric(df[col], errors="coerce") == 1, "Salary"].dropna().astype(float)
                if len(vals) > 0:
                    work_map[label] = vals.mean().round(2)
    else:
        work_series = avg_by_column(df, "WorkLocation")
        if not work_series.empty:
            work_map = work_series.to_dict()

    if work_map:
        work_series2 = pd.Series(work_map)
        fig = bar_chart_from_series(work_series2, "Average Salary by Work Mode", xlabel="Work Mode")
        work_chart = os.path.join(tmp_dir, "workmode.png")
        save_chart(fig, work_chart)
        charts.append(("Average Salary by Work Mode", work_chart))
        tables["Average Salary by Work Mode"] = [{"label": k, "avgSalary": float(v)} for k, v in work_map.items()]
        summary_lines.append(f"Work mode highest average: {work_series2.idxmax()} (${work_series2.max():,.2f})")

    # Education: boolean columns or Education column
    edu_cols = ["Associate", "Bachelors", "College", "Doctorate", "Masters", "High School", "Diploma"]
    edu_map = {}
    has_edu_bool = any(c in df.columns for c in edu_cols)
    if has_edu_bool:
        for col in edu_cols:
            if col in df.columns:
                vals = df.loc[pd.to_numeric(df[col], errors="coerce") == 1, "Salary"].dropna().astype(float)
                if len(vals) > 0:
                    edu_map[col] = vals.mean().round(2)
    else:
        edu_series = avg_by_column(df, "Education")
        if not edu_series.empty:
            edu_map = edu_series.to_dict()

    if edu_map:
        edu_series2 = pd.Series(edu_map)
        fig = bar_chart_from_series(edu_series2, "Average Salary by Education Level", xlabel="Education")
        edu_chart = os.path.join(tmp_dir, "education.png")
        save_chart(fig, edu_chart)
        charts.append(("Average Salary by Education Level", edu_chart))
        tables["Average Salary by Education"] = [{"label": k, "avgSalary": float(v)} for k, v in edu_map.items()]
        summary_lines.append(f"Education with highest avg salary: {edu_series2.idxmax()} (${edu_series2.max():,.2f})")

    # Experience trend
    exp_series = avg_by_experience(df, "YearsCodePro")
    if not exp_series.empty:
        fig = bar_chart_from_series(exp_series, "Average Salary by Years of Professional Coding", xlabel="YearsCodePro", rotate_x=True)
        exp_chart = os.path.join(tmp_dir, "experience.png")
        save_chart(fig, exp_chart)
        charts.append(("Average Salary by Experience (YearsCodePro)", exp_chart))
        tables["Average Salary by Experience"] = [{"label": int(idx), "avgSalary": float(v)} for idx, v in exp_series.items()]
        # show top experience bucket
        top_exp = exp_series.idxmax()
        summary_lines.append(f"Years of experience with highest avg salary: {top_exp} (${exp_series.max():,.2f})")

    # Optional: Tech stack — fall back to NumberOfWebFrameworksKnown or Developer boolean
    if "NumberOfWebFrameworksKnown" in df.columns:
        tech_series = df.groupby("NumberOfWebFrameworksKnown")["Salary"].mean().round(2)
        if not tech_series.empty:
            fig = bar_chart_from_series(tech_series, "Average Salary by # Web Frameworks Known", xlabel="# Web Frameworks")
            tech_chart = os.path.join(tmp_dir, "tech.png")
            save_chart(fig, tech_chart)
            charts.append(("Average Salary by # Web Frameworks Known", tech_chart))
            tables["Average Salary by # Web Frameworks Known"] = [{"label": int(idx), "avgSalary": float(v)} for idx, v in tech_series.items()]

    # Make summary if empty
    if not summary_lines:
        summary_lines = ["No clear summary could be generated (insufficient columns or data)."]

    # Compose PDF
    compose_pdf(pdf_path, summary_lines, charts, tables)

    # Print JSON success with path (relative to server)
    print(json.dumps({"success": True, "pdf": pdf_path}))
    sys.exit(0)


if __name__ == "__main__":
    # The Node route spawns this script and doesn't need stdin data.
    # But if stdin is provided we ignore it and just use CSV.
    main()
