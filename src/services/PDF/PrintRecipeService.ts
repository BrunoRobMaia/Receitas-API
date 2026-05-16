// src/services/Pdf/RecipePdfService.ts

import PDFDocument from "pdfkit";

interface GenerateRecipePdfRequest {
  receita: {
    nome: string | null;
    porcoes: number | null;
    tempo_preparo_minutos: number | null;
    ingredientes: string | null;
    modo_preparo: string;
  };
  categoria?: {
    nome: string | null;
  } | null;
  usuario?: {
    nome: string | null;
  } | null;
}

const C = {
  spice: "#C84B31",
  spiceLight: "#F2E0DA",
  gold: "#D4A853",
  ink: "#1E1E1E",
  muted: "#6B6B6B",
  rule: "#E0D5CC",
  cardBg: "#FFFAF7",
  cardBorder: "#EDD9CC",
  white: "#FFFFFF",
  badge: "#3D5A80",
};

export class RecipePdfService {
  async generate({
    receita,
    categoria,
    usuario,
  }: GenerateRecipePdfRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: receita.nome || "Receita",
          Author: usuario?.nome || "Receitas API",
          Subject: categoria?.nome || "Culinária",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = 595.28; // A4 width  (pt)
      const H = 841.89; // A4 height (pt)
      const PAD = 64; // inner horizontal padding (centraliza o conteúdo)

      /* ====================================================
         1. FAIXA SUPERIOR — cor sólida com textura de linhas
         ==================================================== */
      const HERO_H = 200;

      // Fundo principal da hero
      doc.rect(0, 0, W, HERO_H).fill(C.spice);

      // Linhas decorativas diagonais sutis (textura)
      doc.save();
      doc.rect(0, 0, W, HERO_H).clip();
      doc.lineWidth(0.4).strokeColor("#00000015");
      for (let x = -HERO_H; x < W + HERO_H; x += 18) {
        doc
          .moveTo(x, 0)
          .lineTo(x + HERO_H, HERO_H)
          .stroke();
      }
      doc.restore();

      // Faixa dourada inferior da hero
      doc.rect(0, HERO_H - 6, W, 6).fill(C.gold);

      // Categoria badge (topo)
      if (categoria?.nome) {
        const badgeLabel = categoria.nome.toUpperCase();
        const badgeX = PAD;
        const badgeY = 22;
        const badgePad = 10;
        doc.font("Helvetica-Bold").fontSize(8);
        const bW = doc.widthOfString(badgeLabel) + badgePad * 2;
        doc.roundedRect(badgeX, badgeY, bW, 20, 4).fill(C.gold);
        doc
          .fillColor(C.ink)
          .fontSize(8)
          .font("Helvetica-Bold")
          .text(badgeLabel, badgeX + badgePad, badgeY + 5, {
            lineBreak: false,
          });
      }

      // Título da receita
      const nomeTxt = receita.nome || "Receita";
      doc
        .font("Helvetica-Bold")
        .fontSize(32)
        .fillColor(C.white)
        .text(nomeTxt, PAD, 60, {
          width: W - PAD * 2,
          align: "left",
          lineGap: 4,
        });

      /* ====================================================
         2. CARTÕES DE INFORMAÇÃO (3 colunas)
         ==================================================== */
      const INFO_Y = HERO_H + 28;
      const cardW = (W - PAD * 2 - 16) / 3;
      const cardH = 72;

      const infos = [
        {
          label: "PORCOES",
          value: String(receita.porcoes || "—"),
          iconType: "portions",
        },
        {
          label: "TEMPO",
          value: receita.tempo_preparo_minutos
            ? `${receita.tempo_preparo_minutos} min`
            : "—",
          iconType: "clock",
        },
        {
          label: "CATEGORIA",
          value: categoria?.nome || "Nao informada",
          iconType: "category",
        },
      ];

      infos.forEach((info, i) => {
        const cx = PAD + i * (cardW + 8);
        const iconCx = cx + cardW / 2;
        const iconCy = INFO_Y + 18;

        // Sombra simulada (offset rect escuro)
        doc.roundedRect(cx + 2, INFO_Y + 2, cardW, cardH, 8).fill("#00000012");
        // Card
        doc
          .roundedRect(cx, INFO_Y, cardW, cardH, 8)
          .fillAndStroke(C.cardBg, C.cardBorder);

        // Ícone desenhado com primitivas (sem Unicode)
        doc.save();
        if (info.iconType === "portions") {
          // Ícone de porções: garfo simplificado — 3 linhas verticais + cabo
          doc.lineWidth(1.5).strokeColor(C.spice);
          // 3 dentes do garfo
          for (let d = -4; d <= 4; d += 4) {
            doc
              .moveTo(iconCx + d, iconCy - 7)
              .lineTo(iconCx + d, iconCy)
              .stroke();
          }
          // Cabo
          doc
            .moveTo(iconCx, iconCy)
            .lineTo(iconCx, iconCy + 7)
            .stroke();
          // Barra transversal (base dos dentes)
          doc
            .moveTo(iconCx - 4, iconCy)
            .lineTo(iconCx + 4, iconCy)
            .stroke();
        } else if (info.iconType === "clock") {
          // Ícone de relógio: círculo + ponteiros
          doc.lineWidth(1.5).strokeColor(C.spice);
          doc.circle(iconCx, iconCy, 8).stroke();
          // Ponteiro das horas
          doc
            .moveTo(iconCx, iconCy)
            .lineTo(iconCx, iconCy - 5)
            .stroke();
          // Ponteiro dos minutos
          doc
            .moveTo(iconCx, iconCy)
            .lineTo(iconCx + 4, iconCy - 2)
            .stroke();
        } else if (info.iconType === "category") {
          // Ícone de categoria: tag/etiqueta
          doc.lineWidth(1.5).strokeColor(C.spice);
          // Losango pequeno
          doc
            .moveTo(iconCx, iconCy - 8)
            .lineTo(iconCx + 6, iconCy)
            .lineTo(iconCx, iconCy + 8)
            .lineTo(iconCx - 6, iconCy)
            .closePath()
            .stroke();
          // Pontinho central
          doc.circle(iconCx, iconCy, 1.5).fill(C.spice);
        }
        doc.restore();

        // Valor
        doc
          .font("Helvetica-Bold")
          .fontSize(13)
          .fillColor(C.ink)
          .text(info.value, cx, INFO_Y + 32, {
            width: cardW,
            align: "center",
            lineBreak: false,
          });

        // Label
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(C.muted)
          .text(info.label, cx, INFO_Y + 50, {
            width: cardW,
            align: "center",
            lineBreak: false,
          });
      });

      /* ====================================================
         3. CORPO — dois painéis lado a lado
         ==================================================== */
      const BODY_Y = INFO_Y + cardH + 32;
      const colGap = 28;
      const CONTENT_W = W - PAD * 2;
      const col1W = Math.floor(CONTENT_W * 0.38); // ingredientes ~38%
      const col2W = CONTENT_W - col1W - colGap; // preparo ~62%
      const col1X = PAD;
      const col2X = PAD + col1W + colGap;

      // ── Coluna esquerda: INGREDIENTES ─────────────────────
      this.drawSectionHeader(
        doc,
        "Ingredientes",
        col1X,
        BODY_Y,
        col1W,
        C.spice,
        C.gold,
      );

      let leftY = BODY_Y + 36;

      const ingredientes =
        receita.ingredientes?.split("\n").filter((l) => l.trim()) || [];

      doc.font("Helvetica").fontSize(11).fillColor(C.ink);

      ingredientes.forEach((item, idx) => {
        // Alterna fundo zebra
        if (idx % 2 === 0) {
          doc.rect(col1X - 4, leftY - 3, col1W + 8, 22).fill("#F9F3EF");
        }

        // Bullet redondo
        doc.circle(col1X + 6, leftY + 7, 3).fill(C.gold);

        doc
          .fillColor(C.ink)
          .font("Helvetica")
          .fontSize(10)
          .text(item.trim(), col1X + 16, leftY, {
            width: col1W - 20,
            lineBreak: false,
          });

        leftY += 22;
      });

      // ── Coluna direita: MODO DE PREPARO ───────────────────
      this.drawSectionHeader(
        doc,
        "Modo de Preparo",
        col2X,
        BODY_Y,
        col2W,
        C.spice,
        C.gold,
      );

      let rightY = BODY_Y + 36;

      const passos = receita.modo_preparo.split("\n").filter((l) => l.trim());

      passos.forEach((passo, idx) => {
        const stepNum = String(idx + 1).padStart(2, "0");

        // Número do passo em círculo
        doc.circle(col2X + 12, rightY + 9, 12).fill(C.spice);
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(C.white)
          .text(stepNum, col2X, rightY + 4, {
            width: 24,
            align: "center",
            lineBreak: false,
          });

        // Texto do passo
        const passH = doc.heightOfString(passo.trim(), { width: col2W - 36 });
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(C.ink)
          .text(passo.trim(), col2X + 30, rightY, { width: col2W - 36 });

        rightY += Math.max(passH + 14, 32);

        // Linha separadora leve entre passos
        if (idx < passos.length - 1) {
          doc
            .moveTo(col2X + 30, rightY - 6)
            .lineTo(col2X + col2W, rightY - 6)
            .lineWidth(0.5)
            .strokeColor(C.rule)
            .stroke();
        }
      });

      /* ====================================================
         4. RODAPÉ
         ==================================================== */
      const footerY = H - 38;

      doc.rect(0, footerY - 10, W, 48).fill(C.spiceLight);
      doc
        .moveTo(0, footerY - 10)
        .lineTo(W, footerY - 10)
        .lineWidth(2)
        .strokeColor(C.gold)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(C.muted)
        .text(
          `Gerado em ${new Date().toLocaleDateString("pt-BR")}  -  Receitas API`,
          0,
          footerY + 4,
          { width: W, align: "center" },
        );

      // Ornamento do rodapé: losango dourado desenhado com linhas
      const ornX = W / 2;
      const ornY = footerY - 4;
      doc.save();
      doc.lineWidth(1.5).strokeColor(C.gold);
      doc
        .moveTo(ornX, ornY - 5)
        .lineTo(ornX + 5, ornY)
        .lineTo(ornX, ornY + 5)
        .lineTo(ornX - 5, ornY)
        .closePath()
        .stroke();
      doc.restore();

      doc.end();
    });
  }

  private drawSectionHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number,
    color: string,
    accent: string,
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(color)
      .text(title.toUpperCase(), x, y, { width, lineBreak: false });

    const lineY = y + 20;
    doc
      .moveTo(x, lineY)
      .lineTo(x + width, lineY)
      .lineWidth(1.5)
      .strokeColor(accent)
      .stroke();

    doc.circle(x, lineY, 3).fill(accent);
  }
}
