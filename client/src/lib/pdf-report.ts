// مشروع تربية الأغنام — PDF Report Generator
// Generates professional financial reports with white background and clear Arabic RTL layout

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { DashboardStats, FarmData } from './types';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPercent,
} from './format';

interface ReportData {
  stats: DashboardStats;
  farmData: FarmData;
}

/**
 * Generate a professional PDF report with all financial data
 */
export async function generatePDFReport(data: ReportData): Promise<void> {
  const { stats, farmData } = data;

  // Create HTML content for the report
  const reportHTML = createReportHTML(stats, farmData);

  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = reportHTML;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '1200px';
  container.style.direction = 'rtl';
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;

    // Add pages as needed
    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);

    let remainingHeight = imgHeight - (pageHeight - 20);
    while (remainingHeight > 0) {
      pdf.addPage();
      yPosition = -remainingHeight + 10;
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      remainingHeight -= pageHeight - 20;
    }

    // Download PDF
    const filename = `sheep-farm-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Create HTML content for the PDF report
 */
function createReportHTML(stats: DashboardStats, farmData: FarmData): string {
  const today = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isProfit = stats.netProfit >= 0;
  const profitColor = isProfit ? '#22c55e' : '#ef4444';
  const profitText = isProfit ? 'ربح' : 'خسارة';

  return `
    <div style="
      font-family: 'Cairo', 'Tajawal', Arial, sans-serif;
      direction: rtl;
      background: white;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.6;
    ">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0f1a10; padding-bottom: 20px;">
        <h1 style="margin: 0; font-size: 32px; color: #0f1a10; font-weight: 800;">
          🐑 مشروع تربية الأغنام
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          تقرير مالي شامل
        </p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
          التاريخ: ${today}
        </p>
      </div>

      <!-- Executive Summary -->
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #0f1a10; font-weight: 700;">
          📊 الملخص التنفيذي
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; color: #0f1a10;">صافي الربح / الخسارة</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; font-weight: 700; color: ${profitColor}; font-size: 16px;">
              ${isProfit ? '+' : ''}${formatCurrency(stats.netProfit)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; color: #0f1a10;">هامش الربح</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: ${profitColor}; font-weight: 700;">
              ${formatPercent(stats.profitMargin)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600; color: #0f1a10;">الأغنام المتاحة حالياً</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; font-weight: 700; color: #22c55e;">
              ${formatNumber(stats.currentOwned)} رأس
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: 600; color: #0f1a10;">تكلفة الرأس الواحد</td>
            <td style="padding: 12px; text-align: left; font-weight: 700;">
              ${formatCurrency(stats.costPerHead)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Financial Summary -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #0f1a10; font-weight: 700;">
          💰 قائمة الدخل
        </h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr style="background: #0f1a10; color: white;">
            <th style="padding: 12px; text-align: right; font-weight: 700;">البند</th>
            <th style="padding: 12px; text-align: left; font-weight: 700;">المبلغ</th>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">إجمالي إيرادات البيع</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: #22c55e; font-weight: 600;">
              ${formatCurrency(stats.totalSaleRevenue)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 12px; color: #666;">
              &nbsp;&nbsp;&nbsp;&nbsp;(${formatNumber(stats.totalSold)} رأس بمتوسط ${formatCurrency(stats.averageSalePrice)}/رأس)
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;"></td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600;">ناقص: تكلفة المشتريات</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: #ef4444; font-weight: 600;">
              (${formatCurrency(stats.totalPurchaseCost)})
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-size: 12px; color: #666;">
              &nbsp;&nbsp;&nbsp;&nbsp;(${formatNumber(stats.totalPurchased)} رأس بمتوسط ${formatCurrency(stats.averagePurchasePrice)}/رأس)
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;"></td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600;">ناقص: المصاريف التشغيلية</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: #ef4444; font-weight: 600;">
              (${formatCurrency(stats.totalExpenses)})
            </td>
          </tr>
          <tr style="background: #0f1a10; color: white; font-weight: 700; font-size: 14px;">
            <td style="padding: 12px;">صافي الربح / الخسارة</td>
            <td style="padding: 12px; text-align: left; color: ${profitColor};">
              ${isProfit ? '+' : ''}${formatCurrency(stats.netProfit)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Flock Status -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #0f1a10; font-weight: 700;">
          🐑 حالة القطيع
        </h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr style="background: #0f1a10; color: white;">
            <th style="padding: 12px; text-align: right; font-weight: 700;">البيان</th>
            <th style="padding: 12px; text-align: left; font-weight: 700;">العدد</th>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">إجمالي المشتريات</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; font-weight: 600;">
              ${formatNumber(stats.totalPurchased)} رأس
            </td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">ناقص: المبيعات</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: #ef4444; font-weight: 600;">
              (${formatNumber(stats.totalSold)} رأس)
            </td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">ناقص: الخسائر</td>
            <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; color: #ef4444; font-weight: 600;">
              (${formatNumber(stats.totalLost)} رأس)
            </td>
          </tr>
          <tr style="background: #e8f5e9; border: 2px solid #22c55e;">
            <td style="padding: 12px; font-weight: 700;">المتاح حالياً</td>
            <td style="padding: 12px; text-align: left; color: #22c55e; font-weight: 700; font-size: 16px;">
              ${formatNumber(stats.currentOwned)} رأس
            </td>
          </tr>
        </table>
      </div>

      <!-- Expenses Breakdown -->
      ${stats.totalExpenses > 0 ? `
        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #0f1a10; font-weight: 700;">
            📈 تفصيل المصاريف
          </h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <tr style="background: #0f1a10; color: white;">
              <th style="padding: 12px; text-align: right; font-weight: 700;">الفئة</th>
              <th style="padding: 12px; text-align: left; font-weight: 700;">المبلغ</th>
              <th style="padding: 12px; text-align: left; font-weight: 700;">النسبة</th>
            </tr>
            ${(['علف', 'حبوب', 'دواء', 'أخرى'] as const).map((cat, idx) => {
              const amount = stats.expensesByCategory[cat] || 0;
              const pct = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
              if (amount === 0) return '';
              return `
                <tr ${idx % 2 === 0 ? 'style="background: #f9f9f9;"' : ''}>
                  <td style="padding: 12px; border-bottom: 1px solid #ddd;">${cat}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left; font-weight: 600;">
                    ${formatCurrency(amount)}
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: left;">
                    ${formatPercent(pct)}
                  </td>
                </tr>
              `;
            }).join('')}
            <tr style="background: #0f1a10; color: white; font-weight: 700;">
              <td style="padding: 12px;">الإجمالي</td>
              <td style="padding: 12px; text-align: left;">${formatCurrency(stats.totalExpenses)}</td>
              <td style="padding: 12px; text-align: left;">100٪</td>
            </tr>
          </table>
        </div>
      ` : ''}

      <!-- Recent Transactions -->
      <div style="margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #0f1a10; font-weight: 700;">
          📋 آخر 10 معاملات
        </h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 12px;">
          <tr style="background: #0f1a10; color: white;">
            <th style="padding: 10px; text-align: right; font-weight: 700;">التاريخ</th>
            <th style="padding: 10px; text-align: right; font-weight: 700;">النوع</th>
            <th style="padding: 10px; text-align: right; font-weight: 700;">الوصف</th>
            <th style="padding: 10px; text-align: left; font-weight: 700;">المبلغ</th>
          </tr>
          ${farmData.purchases.slice(0, 10).map((p, idx) => `
            <tr ${idx % 2 === 0 ? 'style="background: #f9f9f9;"' : ''}>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatDate(p.date)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">🛒 شراء</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${p.count} رأس من ${p.source}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left; color: #ef4444;">
                (${formatCurrency(p.totalCost)})
              </td>
            </tr>
          `).join('')}
          ${farmData.sales.slice(0, 10).map((s, idx) => `
            <tr ${idx % 2 === 0 ? 'style="background: #f9f9f9;"' : ''}>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formatDate(s.date)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">💰 بيع</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${s.count} رأس لـ ${s.buyerName}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left; color: #22c55e;">
                +${formatCurrency(s.totalRevenue)}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
        <p style="margin: 0;">تم إنشاء هذا التقرير بواسطة نظام مشروع تربية الأغنام</p>
        <p style="margin: 5px 0 0 0;">جميع البيانات محفوظة محلياً على جهازك</p>
      </div>
    </div>
  `;
}
