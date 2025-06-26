# Uncomment the following imports before adding the Model code

from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

class CarMake(models.Model):
    # 차량 제조사의 이름 (필수, 최대 100자)
    name = models.CharField(null=False, max_length=100, default='Unnamed Make')
    
    # 제조사에 대한 설명 (선택 사항)
    description = models.TextField()
    
    # 추가 필드 
    country = models.CharField(max_length=50, blank=True, null=True) # 제조사 국가
    established_year = models.IntegerField(null=True, blank=True) # 설립 연도

    # __str__ 메소드는 CarMake 객체가 문자열로 표현될 때 사용
    # 관리자 페이지나 콘솔에서 객체를 식별하기 용이
    def __str__(self):
        # 제조사의 이름을 반환하도록 설정
        return self.name

class CarModel(models.Model):
    # CarMake 모델과의 다대일 관계 (외래 키)
    # CarMake 객체가 삭제될 때 연결된 CarModel 객체도 함께 삭제.
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    
    # Cloudant 데이터베이스의 딜러 ID (정수형)
    # 이 필드는 외부 DB의 ID를 참조하므로, 데이터 무결성 유지를 위해 null=False를 유지합니다.
    dealer_id = models.IntegerField(null=False, default=0) # 필요에 따라 default 값 또는 null=True 변경 가능
    
    # 차량 모델 이름
    name = models.CharField(null=False, max_length=100)
    
    # 차량 타입 선택지 정의
    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
        ('HATCHBACK', 'Hatchback'), # 추가 타입 예시
        ('COUPE', 'Coupe'),        # 추가 타입 예시
        ('PICKUP', 'Pickup Truck'),
        ('Hansle', 'Cho') # 추가 타입 예시
    ]
    # 차량 타입 (정의된 선택지 중에서 선택)
    type = models.CharField(null=False, max_length=10, choices=CAR_TYPES, default='SUV')
    
    # 제조 연도 (정수형, 특정 범위 유효성 검사)
    year = models.IntegerField(
        null=False,
        default=now().year, # 현재 연도를 기본값으로 설정
        validators=[
            MaxValueValidator(now().year), # 현재 연도보다 클 수 없음
            MinValueValidator(1900)        # 1900년보다 작을 수 없음 (예시)
        ]
    )
    
    
    mileage = models.IntegerField(null=True, blank=True) # 주행 거리
    color = models.CharField(max_length=30, blank=True, null=True) # 색상

    # __str__ 메소드는 CarModel 객체가 문자열로 표현될 때 사용
    # 차량 제조사 이름과 모델 이름을 함께 반환하여 명확하게 식별합니다.
    def __str__(self):
        return f"{self.car_make.name} - {self.name}" # "제조사 이름 - 모델 이름" 형식으로 반환
