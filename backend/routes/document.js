import express from "express";
import Document from "../models/Document.js";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/auth.js";
import PDFDocument from "pdfkit";


const router = express.Router();

// ✅ Create a new document in a workspace
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, workspaceId } = req.body;

    const document = new Document({
      title,
      workspace: workspaceId,
      createdBy: req.user.id,
    });

    await document.save();

    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Get all documents for a workspace
router.get("/workspace/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      workspace: req.params.workspaceId,
    }).populate("createdBy", "name email");

    res.json(documents);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Get a single document by ID
router.get("/:documentId", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId).populate(
      "createdBy",
      "name email"
    );

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Delete a document
router.delete("/:documentId", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Optional: only creator can delete
    if (document.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await document.deleteOne();
    res.json({ msg: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Download document as text file
router.get("/:documentId/download", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Convert Quill Delta → plain text
    let textContent = "";
    if (document.content?.ops) {
      textContent = document.content.ops
        .map(op => op.insert)
        .join("");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.title}.txt"`
    );
    res.setHeader("Content-Type", "text/plain");

    res.send(textContent);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Download document as PDF
router.get("/:documentId/download/pdf", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    const pdf = new PDFDocument({ margin: 40 });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.title}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    pdf.pipe(res);

    // Title
    pdf.fontSize(16).text(document.title, { underline: true });
    pdf.moveDown();

    if (document.content?.ops) {
      for (const op of document.content.ops) {
        // TEXT
        if (typeof op.insert === "string") {
          pdf.fontSize(11).text(op.insert, {
            continued: false,
          });
        }

        // IMAGE
        if (op.insert?.image) {
          const imageUrl = op.insert.image;

          try {
            const imagePath = imageUrl.includes("http")
              ? imageUrl.replace(
                  `${req.protocol}://${req.get("host")}`,
                  ""
                )
              : imageUrl;

            pdf.moveDown(0.5);
            pdf.image(`.${imagePath}`, {
              fit: [450, 300],
              align: "center",
            });
            pdf.moveDown();
          } catch (imgErr) {
            console.error("Image render failed:", imgErr.message);
          }
        }
      }
    }

    pdf.end();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// ✅ Rename document
router.put("/:documentId/rename", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Optional: only creator can rename
    if (document.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    document.title = title;
    await document.save();

    res.json(document);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ✅ Update document content (autosave)
router.put("/:documentId", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    const document = await Document.findByIdAndUpdate(
      req.params.documentId,
      { content },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});



export default router;
