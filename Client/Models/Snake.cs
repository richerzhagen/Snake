using System;
using System.Collections.Generic;
using System.Text;

namespace Client.Models
{
    public class Snake
    {
        public int id { get; set; }
        public int[] x { get; set; }
        public int[] y { get; set; }
        public string direction { get; set; }
        public int segments { get; set; }
        public string status { get; set; }
    }
}
