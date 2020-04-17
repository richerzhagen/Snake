
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Text;

namespace Client.Models
{
    public class MainModel
    {
        public MainModel(ConcurrentDictionary<string,Snake> Snakes, ConcurrentDictionary<string, Fruit> Fruits)
        {
            this.Snakes = Snakes;
            this.Fruits = Fruits;
        }

        public ConcurrentDictionary<string, Snake> Snakes { get; set; }
        public ConcurrentDictionary<string, Fruit> Fruits { get; set; }
    }
}
