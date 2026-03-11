import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ManuscriptSections {
  introduccion: string;
  metodos: string;
  discusion: string;
}

/**
 * Strips HTML tags from a string, preserving line breaks.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createParagraphs(html: string): Paragraph[] {
  const text = stripHtml(html);
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return lines.map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line.trim(), size: 24, font: 'Times New Roman' })],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      }),
  );
}

export async function exportManuscriptToDocx(
  title: string,
  projectCode: string,
  sections: ManuscriptSections,
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32,
                font: 'Times New Roman',
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          // Project code
          new Paragraph({
            children: [
              new TextRun({
                text: projectCode,
                italics: true,
                size: 20,
                font: 'Times New Roman',
                color: '666666',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Introduccion
          new Paragraph({
            children: [
              new TextRun({
                text: 'INTRODUCCION',
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...createParagraphs(sections.introduccion),

          // Metodos
          new Paragraph({
            children: [
              new TextRun({
                text: 'METODOS',
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...createParagraphs(sections.metodos),

          // Discusion
          new Paragraph({
            children: [
              new TextRun({
                text: 'DISCUSION',
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...createParagraphs(sections.discusion),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${projectCode || 'manuscrito'}_${title.replace(/\s+/g, '_').slice(0, 30)}.docx`;
  saveAs(blob, filename);
}
