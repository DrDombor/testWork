
public class Triangle
{
	
	public static double Square(double sideA, double sideB, double sideC)
	{
		//проверка, что введены положительные размеры сторон
		if((a < 0) || (b < 0) ||(c < 0)
		{
			throw new ArgumentException("Ñòîðîíû íå ìîãóò áûòü ìåíüøå íóëÿ");
		}
		double legA, legB, hypotenuse;
		//тут я понял, что в условии задачи не сказано, что будут четко вписывать в порядке катет/катет/гипотенуза
		
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
		
		//начало проверки является ли треугольник прямоугольным
		double squareHypotenuse = Math.Pow(hypotenuse,2);
		double squareLegA = Math.Pow(legA,2);
		double squareLegB = Math.Pow(legB,2);

		if(squareHypotenuse != (squareLegA + squareLegB))
		{
			throw new ArgumentException("Òðåóãîëüíèê íå ÿâëÿåòñÿ ïðÿìîóãîëüíûì");
		}
		//тут включается проверка на слишком большие значения
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
	Assert.That(squareExceorion.Message, Is.EqualTo("Òðåóãîëüíèê íå ÿâëÿåòñÿ ïðÿìîóãîëüíûì"));
	var newSquareEx = Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,3.0,3.0));
	Assert.That(newSquareEx.Message, Is.EqualTo("Ñòîðîíû íå ìîãóò áûòü ìåíüøå íóëÿ"));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,-3.0,3.0));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(3.0,3.0,-3.0));
	Assert.Throws<System.ArgumentException>(() => Rectangle.Square(-3.0,3.0,3.0));
	// на переполнение честно не подобрал значения - торопился
}
