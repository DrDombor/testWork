--������ �� ������� ��� � ��� ���� ������ ������ "������" � "�������". ������� � ��������� - Clients, ������� � ��������� Purchases.
 
 select CustomerId, RegistrationDateTime from Clients 
 where CustomerId not in (select CustomerId from Purchases where ProductName = '�������') 
 and CustomerId in (select CustomerId from Purchases where ProductName = '������') 