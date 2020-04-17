using Newtonsoft.Json;
using Server.Models;
using SuperSocket.SocketBase;
using SuperWebSocket;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace Server
{
    class Program
    {
        private static SuperWebSocket.WebSocketServer wsServer;
        private static List<WebSocketSession> clientList = new List<WebSocketSession>();
        public static ConcurrentDictionary<string, Snake> Snakes = new ConcurrentDictionary<string, Snake>();
        public static ConcurrentDictionary<string, Fruit> Fruits = new ConcurrentDictionary<string, Fruit>();
        public static MainModel MainModel = new MainModel();
        public static TempModel TempModel = new TempModel();
        public static int FruitId = 0;
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
        static void Main(string[] args)
        {
            MainModel.Snakes = Snakes;
            Fruit fruit = createFruit(FruitId);
            Fruits.AddOrUpdate("0", fruit, (key, oldValue) => fruit);
            MainModel.Fruits = Fruits;

            wsServer = new SuperWebSocket.WebSocketServer();
            int port = 8080;
            wsServer.Setup(port);
            wsServer.NewSessionConnected += WsServer_NewSessionConnected;
            wsServer.NewMessageReceived += wsServer_NewMessageReceived;
            wsServer.NewDataReceived += wsServer_NewDataReceived;
            wsServer.SessionClosed += wsServer_SessionClosed;
            wsServer.Start();
            Console.WriteLine("Server is running on port: " + port + ". Enter to exit...");
            Console.Read();
            wsServer.Stop();
        }

        private static void wsServer_SessionClosed(WebSocketSession session, CloseReason value)
        {
            Console.WriteLine("SessionClosed: " + session.SessionID);
            Snakes.TryRemove(session.SessionID, out _);
            clientList.Remove(session);

        }

        private static void wsServer_NewDataReceived(WebSocketSession session, byte[] value)
        {
            Console.WriteLine("NewDataReceived");
        }

        private static void wsServer_NewMessageReceived(WebSocketSession session, string responseModel)
        {
            ResponseModel rm = JsonConvert.DeserializeObject<ResponseModel>(responseModel, settings);

            if (rm.Fruit != null)
            {
                //Console.WriteLine("fruit eaten, id: " + rm.Fruit);
                Fruits.TryRemove(rm.Fruit, out _);
                FruitId++;
                Fruit fruit = createFruit(FruitId);
                Fruits.AddOrUpdate(fruit.id, fruit, (key, oldValue) => fruit);
                //Console.WriteLine("fruit added, id: " + fruit.id);
            }

            if (rm.Snake.status == "dead")
            {
                //Console.WriteLine("snake died: " + session.SessionID);
                MainModel.Snakes.TryRemove(session.SessionID, out _);
            }
            else
            {
                MainModel.Snakes.AddOrUpdate(session.SessionID, rm.Snake, (key, oldValue) => rm.Snake);
            }

            foreach (WebSocketSession client in clientList)
            {
                TempModel.Snakes = new ConcurrentDictionary<string, Snake>(MainModel.Snakes.Where(x => x.Key != client.SessionID));
                TempModel.Fruits = new ConcurrentDictionary<string, Fruit>(MainModel.Fruits);
                client.Send(JsonConvert.SerializeObject(TempModel));
            }

        }

        private static void WsServer_NewSessionConnected(WebSocketSession session)
        {
            Console.WriteLine("NewSessionConnected: " + session.SessionID);
            clientList.Add(session);
        }
    }
}
