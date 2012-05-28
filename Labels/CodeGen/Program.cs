using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NAttrArgs;

namespace CodeGen
{
    class Program
    {
        [NArg(AltName = "count")]
        uint m_numOfCodes = 0;

        [NArg(AltName = "seed", IsOptional=true, OptionalArgName="value")]
        int m_seed = 0;

        [NArg(AltName="showcount", IsOptional=true)]
        bool m_isShowCount = false;

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
            new NAttrArgs.ArgParser<Program>("CodeGen").Parse(this, args);
        }

        void Run()
        {
            var rand = m_seed > 0 ? new Random(m_seed) : new Random();

            for (uint count = 0; count < m_numOfCodes; ++count)
            {
                string code = string.Empty;

                for (uint charCount = 0; charCount < 5; ++charCount)
                    code += (char)rand.Next(65, 91);

                if (m_isShowCount == true)
                    Console.WriteLine("{0}: {1}", count, code);
                else
                    Console.WriteLine("{0}", code);
            }
        }
    }
}
