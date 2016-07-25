
public class Triangle
{
	
	public static double Square(double sideA, double sideB, double sideC)
	{
		//��������, ��� ������� ������������� ������� ������
		if((a < 0) || (b < 0) ||(c < 0)
		{
			throw new ArgumentException("������� �� ����� ���� ������ ����");
		}
		double legA, legB, hypotenuse;
		//��� � �����, ��� � ������� ������ �� �������, ��� ����� ����� ��������� � ������� �����/�����/����������
		
		if(sideC > sideA && sideC > sideB)
		{
			hypotenuse = sideC;
			legA = sideA;
			legB = sideB;
		}
		if(sideB > sideA && sideB > sideC)
		{
			hypotenuse = sideB;
			legA = sideA;
			legB = sideC;
		}
		if(sideA > sideC && sideA > sideB)
		{
			hypotenuse = sideA;
			legA = sideB;
			legB = sideC;
		}
		
		//������ �������� �������� �� ����������� �������������
		double squareHypotenuse = Math.Pow(hypotenuse,2);
		double squareLegA = Math.Pow(legA,2);
		double squareLegB = Math.Pow(legB,2);

		if(squareHypotenuse != (squareLegA + squareLegB))
		{
			throw new ArgumentException("����������� �� �������� �������������");
		}
		//��� ���������� �������� �� ������� ������� ��������
		double square = checked(0.5 * legA * legB);
		
		return square;
	}
}


[TestMethod]
public void RightSquare()
{
	double square = Rectangle.Square(3.0,4.0,5.0);
	Assert.AreEqual(6.0,square);
	var squareExceorion = Assert.Throws<System.ArgumentException>(() => Rectangle.Square(3.0,3.0,3.0));
	Assert.That(squareExceorion.Message, Is.EqualTo("����������� �� �������� �������������"));
	var newSquareEx = Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,3.0,3.0));
	Assert.That(newSquareEx.Message, Is.EqualTo("������� �� ����� ���� ������ ����"));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,-3.0,3.0));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(3.0,3.0,-3.0));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,3.0,3.0));
	// �� ������������ ������ �� �������� �������� - ���������
}