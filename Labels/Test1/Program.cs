using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Office.Interop.Word;

namespace Test1
{
    class Program
    {
        const string docPath = @"C:\foo.docx";

        static void Main(string[] args)
        {
            try
            {
                new Program().Run();
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("Whoops:{0}", e.Message);
            }
        }

        void MakePara(Document doc, string text, bool isBold = false, float fontSize = 11, string fontName = "Times New Roman")
        {
            var para = doc.Paragraphs.Add();

            para.Range.Font.Bold = Convert.ToInt32(isBold);
            para.Range.Font.Name = fontName;
            para.Range.Font.Size = fontSize;

            para.Range.Text = text;
            para.Range.InsertParagraphAfter();
        }

        void PopCell(Range range, string text, bool isBold = false, float fontSize = 11, string fontName = "Times New Roman")
        {
            Paragraph para;
            
            if (isBold == true)
                para = range.Paragraphs.First;
            else
                para = range.Paragraphs.Add();

            para.Range.Font.Bold = Convert.ToInt32(isBold);
            para.Range.Font.Name = fontName;
            para.Range.Font.Size = fontSize;

            para.Range.Text = text;
        }


        void Run()
        {
            File.Delete(docPath);

            var word = new Microsoft.Office.Interop.Word.Application();
            var doc = word.Documents.Add();

            var range = doc.Range();

            var table = doc.Tables.Add(range, 6, 2);

            //WdBuiltinStyle foo = WdBuiltinStyle.wdStyleTableLightGrid;          
            //table.set_Style(foo);

            for (int row = 0; row < 6; ++row)
                for (int col = 1; col <= 2; ++col)
                {
                    var cell = table.Cell(row, col);

                    PopCell(cell.Range, "Horsell Jubilation Balloon Race", true, 12);
                    PopCell(cell.Range, "");
                    PopCell(cell.Range, "Notice to the finder of this balloon:");
                    PopCell(cell.Range, "Please go to the website www.diamondballoons.info to register your details and the location of the balloon. By doing so you will be entered into a draw for a £25 Amazon Gift Voucher. Good luck and thank you!");

                }
            doc.SaveAs2(docPath);
            doc.Close();
        }
    }
}
