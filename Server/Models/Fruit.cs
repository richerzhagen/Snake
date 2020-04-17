using System;
using System.Collections.Generic;
using System.Text;

namespace Server.Models
{
    class Fruit
    {
        public Fruit(string id, int x, int y)
        {
            this.id = id;
            this.x = x;
            this.y = y;
        }
        public string id { get; set; }
        public int x { get; set; }
        public int y { get; set; }
    }
}
