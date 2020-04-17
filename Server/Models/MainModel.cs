using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;

namespace Server.Models
{
    class MainModel
    {
        public ConcurrentDictionary<string, Snake> Snakes { get; set; }
        public ConcurrentDictionary<string, Fruit> Fruits { get; set; }
    }
}
