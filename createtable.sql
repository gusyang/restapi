create table dbo.promotiongroup
(id int identity(1,1),
EmailAddress varchar(128),
Enable char(1) default 'Y',
CountryCode char(3) default 'USA',
NickName nvarchar(80),
Reserved1 char(50)
)

    