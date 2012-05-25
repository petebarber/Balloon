using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Office.Interop.Word;

namespace Test1
{
    class Program
    {
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


        void Run()
        {
            var word = new Microsoft.Office.Interop.Word.Application();
            var doc = word.Documents.Add();

            doc.PageSetup.TextColumns.Add();

            foreach (int n in Enumerable.Range(0, 100))
            {
                MakePara(doc, "Horsell Jubilation Balloon Race", true, 12);
                MakePara(doc, "");
                MakePara(doc, "Notice to the finder of this balloon:");
                MakePara(doc, "Please go to the website www.diamondballoons.info to register your details and the location of the balloon. By doing so you will be entered into a draw for a £25 Amazon Gift Voucher. Good luck and thank you!");

                // TODO: Vertical spacing
            }

            doc.SaveAs2(@"C:\foo.docx");

            doc.Close();
        }
    }
}
