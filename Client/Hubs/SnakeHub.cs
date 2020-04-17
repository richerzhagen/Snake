using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Client.Models;


namespace Client.Hubs
{
    public class SnakeHub : Hub
    {

        public ConcurrentDictionary<string, Snake> Snakes = new ConcurrentDictionary<string, Snake>();
        //public ConcurrentDictionary<string, Fruit> Fruits = new ConcurrentDictionary<string, Fruit>();
        public MainModel MainModel = new MainModel(new ConcurrentDictionary<string, Snake>(), new ConcurrentDictionary<string, Fruit>());
        public TempModel TempModel = new TempModel();
        public int FruitId = 0;
        //Fruit fruit = createFruit(FruitId);
        //mainModel.Fruits.AddOrUpdate("0", fruit, (key, oldValue) => fruit);


        public static JsonSerializerSettings settings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            MissingMemberHandling = MissingMemberHandling.Ignore
        };

        public static Fruit createFruit(int id)
        {
            Random rnd = new Random();
            int x = rnd.Next(1, 108) * 10;
            int y = rnd.Next(1, 70) * 10;
            return new Fruit(id.ToString(), x, y);
        }

        public async Task SendMessage(string user, string message)
        {
            ResponseModel rm = JsonConvert.DeserializeObject<ResponseModel>(message, settings);

            if (rm.Fruit != null)
            {
                //Console.WriteLine("fruit eaten, id: " + rm.Fruit);
                MainModel.Fruits.TryRemove(rm.Fruit, out _);
                FruitId++;
                Fruit fruit = createFruit(FruitId);
                MainModel.Fruits.AddOrUpdate(fruit.id, fruit, (key, oldValue) => fruit);
                //Console.WriteLine("fruit added, id: " + fruit.id);
            }

            if (rm.Snake.status == "dead")
            {
                //Console.WriteLine("snake died: " + session.SessionID);
                MainModel.Snakes.TryRemove(user, out _);
            }
            else
            {
                MainModel.Snakes.AddOrUpdate(user, rm.Snake, (key, oldValue) => rm.Snake);
            }
//            TempModel.Snakes = new ConcurrentDictionary<string, Snake>(MainModel.Snakes.Where(x => x.Key != "client.SessionID"));
            TempModel.Snakes = new ConcurrentDictionary<string, Snake>(MainModel.Snakes);
            TempModel.Fruits = new ConcurrentDictionary<string, Fruit>(MainModel.Fruits);

            await Clients.All.SendAsync("ReceiveMessage", user, JsonConvert.SerializeObject(TempModel)) ;
        }


    }

}

