--»схожу из услови€ что у нас есть товары именно "молоко" и "сметана". “аблица с клиентами - Clients, таблица с покупками Purchases.
 
 select CustomerId, RegistrationDateTime from Clients 
 where CustomerId not in (select CustomerId from Purchases where ProductName = 'сметана') 
 and CustomerId in (select CustomerId from Purchases where ProductName = 'молоко') 