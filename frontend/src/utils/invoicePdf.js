import { formatRouteChain, getStopLocations } from './bookingRoute';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN');
};

export const downloadInvoicePdf = async (invoice) => {
  if (!invoice || !invoice.id) {
    throw new Error('Invalid invoice data.');
  }

  const [{ jsPDF }, { default: QRCode }] = await Promise.all([import('jspdf'), import('qrcode')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 44;
  const lineHeight = 20;
  let y = margin;

  const qrValue =
    invoice.qrCode || `STMS-INVOICE-${invoice.id}-${invoice.bookingId}-${invoice.customerId}`;
  const qrDataUrl = await QRCode.toDataURL(qrValue, {
    margin: 1,
    width: 220,
    color: {
      dark: '#0b1b32',
      light: '#FFFFFF'
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('STMS Invoice', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y += 20;
  doc.text(`Invoice #${invoice.id}`, margin, y);
  y += 16;
  doc.text(`Issued: ${formatDateTime(invoice.createdAt)}`, margin, y);
  y += 16;
  doc.text(`Status: ${invoice.status}`, margin, y);

  doc.addImage(qrDataUrl, 'PNG', 420, margin - 8, 130, 130);
  doc.setFontSize(9);
  doc.text('Unique Invoice QR', 438, margin + 132);

  y += 28;
  doc.setDrawColor(210, 220, 236);
  doc.line(margin, y, 550, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Customer Details', margin, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Name: ${invoice.customer?.name || invoice.booking?.customer?.name || '-'}`, margin, y);
  y += 16;
  doc.text(`Email: ${invoice.customer?.email || invoice.booking?.customer?.email || '-'}`, margin, y);

  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Shipment Details', margin, y);
  y += lineHeight;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const route = invoice.booking
    ? formatRouteChain(
        invoice.booking.pickupLocation,
        invoice.booking.deliveryStops,
        invoice.booking.dropLocation
      )
    : '-';
  doc.text(`Route: ${route}`, margin, y, { maxWidth: 340 });
  y += 36;

  const stops = invoice.booking ? getStopLocations(invoice.booking.deliveryStops) : [];
  doc.text(`Stops: ${stops.length ? stops.join(', ') : 'No intermediate stops'}`, margin, y, {
    maxWidth: 340
  });
  y += 20;
  doc.text(`Distance: ${invoice.distanceKm} km`, margin, y);
  y += 16;
  doc.text(`Rate per km: ${formatCurrency(invoice.ratePerKm)}`, margin, y);
  y += 16;
  doc.text(`Total amount: ${formatCurrency(invoice.totalAmount)}`, margin, y);

  const ownerName =
    invoice.booking?.approvedByOwner?.companyName || invoice.booking?.approvedByOwner?.name;
  if (ownerName) {
    y += 20;
    doc.text(`Approved owner: ${ownerName}`, margin, y);
    if (invoice.booking?.approvedByOwner?.ownerVerified) {
      y += 16;
      doc.text('Verification: Verified Transport Owner', margin, y);
    }
  }

  y += 32;
  doc.setDrawColor(210, 220, 236);
  doc.line(margin, y, 550, y);
  y += 18;
  doc.setFontSize(9);
  doc.setTextColor(98, 115, 140);
  doc.text(`QR Token: ${qrValue}`, margin, y, { maxWidth: 500 });

  doc.save(`STMS-Invoice-${invoice.id}.pdf`);
};
