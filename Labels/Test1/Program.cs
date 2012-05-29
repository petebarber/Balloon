using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Office.Interop.Word;
using NAttrArgs;

namespace Test1
{
    class Program
    {

    	[NArg(AltName = "DocFile")]
		private string m_docPath = string.Empty;

    	[NArg(AltName = "CodeFile")]
		private string m_codePath = string.Empty;

    	[NArg(AltName = "Rows")]
		private uint m_numberOfRows = 0;

        static void Main(string[] args)
        {
            try
            {
                new Program(args).Run();
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("Whoops:{0}", e.Message);
            }
        }

    	private int m_count = 0;
    	private TextReader m_tr;

		Program(string[] args)
		{
			new ArgParser<Program>("BalloonLabelMaker").Parse(this, args);

			Console.WriteLine("DocFile:{0}, CodesFile:{1}", m_docPath, m_codePath);

			File.Delete(m_docPath);
		}

        void Run()
        {
        	var word = new Microsoft.Office.Interop.Word.Application();
        	var doc = word.Documents.Add();

        	var pageSetup = doc.PageSetup;

        	pageSetup.PaperSize = WdPaperSize.wdPaperA4;
        	pageSetup.LeftMargin = 2F; // 12.75F;
        	pageSetup.RightMargin = 0F; // 12.1F;
        	pageSetup.TopMargin = 12.75F; // 72F;
        	pageSetup.BottomMargin = 5F; // 72F;
        	pageSetup.HeaderDistance = 40F;
        	pageSetup.FooterDistance = 36F;


			using (m_tr = new StreamReader(m_codePath))	
				MakePage(doc, doc.Paragraphs.Last.Range);

        	doc.SaveAs2(m_docPath);
			doc.Close();
        }

		void MakePage(Document doc, Range range)
		{
            var table = doc.Tables.Add(range, (int)m_numberOfRows, 2);

            table.Rows.SetHeight(136.1F, WdRowHeightRule.wdRowHeightExactly);
			table.Columns.SetWidth(295.65F, WdRulerStyle.wdAdjustNone); // 297.65F

            table.LeftPadding = 0.75F;
            table.RightPadding = 0.75F;
        	table.TopPadding = 5F;

            for (int row = 1; row <= m_numberOfRows; ++row)
                for (int col = 1; col <= 2; ++col)
                {
                	string code = m_tr.ReadLine();

					if (code == null) return;


					Console.WriteLine("Row:{0}, Col:{1}", row, col);
                    var cell = table.Cell(row, col);

                    cell.Range.Delete();
                    cell.VerticalAlignment = WdCellVerticalAlignment.wdCellAlignVerticalCenter;

                    PopCell(cell.Range, "Horsell Jubilation Balloon Race", isBold:true, fontSize:12, first:true);
                    PopCell(cell.Range, "", fontSize:12);
                    PopCell(cell.Range, "Notice to the finder of this balloon:", isBold:true);
                	PopCell(cell.Range, "Please go to the website www.diamondballoons.info to register your details and the location of the balloon. By doing so you will be entered into a draw for a £25 Amazon Gift Voucher. Good luck and thank you!");
					PopCell(cell.Range, code, false, 12, centre: true);
					PopCell(cell.Range, "", fontSize: 12);

                	++m_count;
                }
        }

		void PopCell(Range range, string text, bool isBold = false, float fontSize = 11, string fontName = "Times New Roman", bool first = false, bool centre = false)
		{
			Paragraph para;

			if (first == true)
			{
				para = range.Paragraphs.First;
				para.Alignment = WdParagraphAlignment.wdAlignParagraphCenter;
			}
			else
			{
				para = range.Paragraphs.Add();
				para.Alignment = WdParagraphAlignment.wdAlignParagraphLeft;
			}

			if (text == "" || centre == true)
				para.Alignment = WdParagraphAlignment.wdAlignParagraphCenter;

			//para.Reset();
			para.LeftIndent = 11.7F;
			para.RightIndent = 11.7F;
			para.SpaceBefore = 0F;
			para.SpaceAfter = 0F;

			para.Range.Font.Bold = Convert.ToInt32(isBold);
			para.Range.Font.Name = fontName;
			para.Range.Font.Size = fontSize;

			if (text != "")
				para.Range.Text = text;
		}


    }
}
