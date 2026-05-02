import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  ImageRun,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
  Header,
  Footer,
} from "docx";
import { saveAs } from "file-saver";
import { Event } from "./types";

const NAVY = "1C1C2E";
const GOLD = "C9A84C";
const CREAM = "FAF8F5";
const MUTED = "6B6B6B";
const BORDER_COLOR = "E8E2D9";

const FONT = "Cormorant Garamond";

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };
}

function thinBorder(color = BORDER_COLOR) {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color },
    bottom: { style: BorderStyle.SINGLE, size: 1, color },
    left: { style: BorderStyle.SINGLE, size: 1, color },
    right: { style: BorderStyle.SINGLE, size: 1, color },
  };
}

export async function generateDocx(event: Event) {
  // Try to fetch the logo
  const logoData: Uint8Array | null = null; // SVG logo used in-app; no image for export

  const children: (Paragraph | Table)[] = [];

  // --- Logo ---
  if (logoData) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            data: logoData,
            transformation: { width: 96, height: 96 },
            type: "jpg",
          }),
        ],
      })
    );
  }

  // --- "THE WEDDING CELEBRATION OF" ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: "THE WEDDING CELEBRATION OF",
          font: FONT,
          size: 16,
          color: MUTED,
          allCaps: true,
          characterSpacing: 200,
        }),
      ],
    })
  );

  // --- Couple name ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: event.coupleName,
          font: FONT,
          size: 44,
          bold: true,
          color: NAVY,
        }),
      ],
    })
  );

  // --- Date ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: event.date,
          font: FONT,
          size: 22,
          color: MUTED,
        }),
      ],
    })
  );

  // --- Venue ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: event.venue,
          font: FONT,
          size: 22,
          color: MUTED,
        }),
      ],
    })
  );

  // --- Gold divider line ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD },
      },
      children: [],
    })
  );

  // --- Guest counts & attire ---
  const detailParts: string[] = [];
  for (const gc of event.guestCounts) {
    detailParts.push(`${gc.label}: ${gc.count} guests`);
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: detailParts.join("  |  "),
          font: FONT,
          size: 18,
          color: MUTED,
        }),
      ],
    })
  );

  const attireParts: string[] = [];
  for (const a of event.attire) {
    attireParts.push(`${a.occasion}: ${a.dress}`);
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: "Attire: " + attireParts.join("  |  "),
          font: FONT,
          size: 18,
          color: MUTED,
          italics: true,
        }),
      ],
    })
  );

  // --- Days and sections ---
  for (const day of event.days) {
    // Day header
    children.push(
      new Paragraph({
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD },
        },
        children: [
          new TextRun({
            text: day.label.replace(/---/g, "\u2014").replace(/ — /g, " \u2014 ").toUpperCase(),
            font: FONT,
            size: 24,
            bold: true,
            color: NAVY,
            characterSpacing: 100,
          }),
        ],
      })
    );

    for (const section of day.sections) {
      // Section title
      if (section.title) {
        children.push(
          new Paragraph({
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: section.title,
                font: FONT,
                size: 18,
                bold: true,
                color: GOLD,
                allCaps: true,
                characterSpacing: 150,
              }),
            ],
          })
        );
      }

      // Timeline items as table rows
      const timelineRows: TableRow[] = [];

      for (const item of section.items) {
        // Main row
        timelineRows.push(
          new TableRow({
            children: [
              // Time column (1200 DXA)
              new TableCell({
                width: { size: 1200, type: WidthType.DXA },
                borders: noBorder(),
                verticalAlign: VerticalAlign.TOP,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 40, after: 0 },
                    children: [
                      new TextRun({
                        text: item.time,
                        font: FONT,
                        size: 19,
                        bold: item.isBold,
                        color: item.isBold ? NAVY : "1A1A1A",
                      }),
                    ],
                  }),
                ],
              }),
              // Initials column (900 DXA)
              new TableCell({
                width: { size: 900, type: WidthType.DXA },
                borders: noBorder(),
                verticalAlign: VerticalAlign.TOP,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 40, after: 0 },
                    children: [
                      new TextRun({
                        text: item.initials.join(" / "),
                        font: FONT,
                        size: 17,
                        bold: true,
                        color: NAVY,
                      }),
                    ],
                  }),
                ],
              }),
              // Description column (7260 DXA)
              new TableCell({
                width: { size: 7260, type: WidthType.DXA },
                borders: noBorder(),
                verticalAlign: VerticalAlign.TOP,
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: item.subNote ? 0 : 60 },
                    children: [
                      new TextRun({
                        text: item.description,
                        font: FONT,
                        size: 19,
                        bold: item.isBold,
                        color: item.isBold ? NAVY : "1A1A1A",
                      }),
                    ],
                  }),
                  ...(item.subNote
                    ? [
                        new Paragraph({
                          spacing: { before: 0, after: 60 },
                          indent: { left: 200 },
                          children: [
                            new TextRun({
                              text: item.subNote,
                              font: FONT,
                              size: 16,
                              italics: true,
                              color: MUTED,
                            }),
                          ],
                        }),
                      ]
                    : []),
                ],
              }),
            ],
          })
        );
      }

      if (timelineRows.length > 0) {
        children.push(
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            layout: TableLayoutType.FIXED,
            rows: timelineRows,
          })
        );
      }
    }
  }

  // --- Vendor contact table ---
  const vendorParties = event.parties.filter(
    (p) => p.category === "VENDOR" || p.category === "VENUE"
  );

  if (vendorParties.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 600, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 3, color: NAVY },
        },
        children: [
          new TextRun({
            text: "VENDOR CONTACT DIRECTORY",
            font: FONT,
            size: 24,
            bold: true,
            color: NAVY,
            characterSpacing: 100,
          }),
        ],
      })
    );

    // Header row
    const headerRow = new TableRow({
      tableHeader: true,
      children: ["Role", "Vendor", "Phone", "Email"].map(
        (text) =>
          new TableCell({
            borders: thinBorder(),
            shading: { type: ShadingType.SOLID, color: NAVY },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text,
                    font: FONT,
                    size: 18,
                    bold: true,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          })
      ),
    });

    const vendorRows = vendorParties.map(
      (vendor, idx) =>
        new TableRow({
          children: [
            vendor.role,
            vendor.name,
            vendor.phone || "—",
            vendor.email || "—",
          ].map(
            (text) =>
              new TableCell({
                borders: thinBorder(),
                shading:
                  idx % 2 === 0
                    ? { type: ShadingType.SOLID, color: "FFFFFF" }
                    : { type: ShadingType.SOLID, color: CREAM },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 40 },
                    children: [
                      new TextRun({
                        text,
                        font: FONT,
                        size: 17,
                        color: "1A1A1A",
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    children.push(
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        layout: TableLayoutType.FIXED,
        rows: [headerRow, ...vendorRows],
      })
    );
  }

  // --- Planning Team table ---
  const planningTeam = event.parties.filter((p) => p.category === "PLANNING_TEAM");
  if (planningTeam.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 3, color: NAVY },
        },
        children: [
          new TextRun({
            text: "PLANNING TEAM",
            font: FONT,
            size: 24,
            bold: true,
            color: NAVY,
            characterSpacing: 100,
          }),
        ],
      })
    );

    const teamHeaderRow = new TableRow({
      tableHeader: true,
      children: ["Initials", "Name", "Role", "Email"].map(
        (text) =>
          new TableCell({
            borders: thinBorder(),
            shading: { type: ShadingType.SOLID, color: NAVY },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text,
                    font: FONT,
                    size: 18,
                    bold: true,
                    color: "FFFFFF",
                  }),
                ],
              }),
            ],
          })
      ),
    });

    const teamRows = planningTeam.map(
      (member, idx) =>
        new TableRow({
          children: [
            member.initials,
            member.name,
            member.role,
            member.email || "—",
          ].map(
            (text) =>
              new TableCell({
                borders: thinBorder(),
                shading:
                  idx % 2 === 0
                    ? { type: ShadingType.SOLID, color: "FFFFFF" }
                    : { type: ShadingType.SOLID, color: CREAM },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    spacing: { before: 40, after: 40 },
                    children: [
                      new TextRun({
                        text,
                        font: FONT,
                        size: 17,
                        color: "1A1A1A",
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    children.push(
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        layout: TableLayoutType.FIXED,
        rows: [teamHeaderRow, ...teamRows],
      })
    );
  }

  // --- Build document ---
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 20,
            color: "1A1A1A",
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240,
              height: 15840,
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Sample Events Studio  |  Confidential",
                    font: FONT,
                    size: 14,
                    color: MUTED,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${event.coupleName.replace(/\s+/g, "_")}_Timeline.docx`;
  saveAs(blob, filename);
}
