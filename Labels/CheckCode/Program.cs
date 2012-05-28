using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.IO;
using NAttrArgs;

namespace CheckCode
{
	class Program
	{
		[NArg(AltName = "CodesFile")]
        string m_codesFile = string.Empty;

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

        Program(string[] args)
        {
            new NAttrArgs.ArgParser<Program>("CodeCheck").Parse(this, args);
        }

		void Run()
		{
			List<string> codes = new List<string>();

			string s;

			using (var sr = new StreamReader(m_codesFile))
				while ((s = sr.ReadLine()) != null)
					codes.Add(s);

			Console.WriteLine("Number of codes:{0}", codes.Count);

			foreach (string code in codes)
			{
				var count = codes.FindAll(x => x == code).Count;

				if (count > 1)
					Console.WriteLine("Code({0}) found:{1}", code, count);
			}
		}
	}
}
