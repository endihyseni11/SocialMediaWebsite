Create database SocialMediaApplication
use SocialMediaApplication

SET IDENTITY_INSERT Users ON;
create table Users(
userId int NOT NULL IDENTITY(1,1) PRIMARY KEY,
username varchar(30) not null,
name varchar(30) not null,
surname varchar(30) not null,
email varchar(30) null,
password varchar(200) not null,
refreshToken varchar(500) not null,
tokenCreated datetime2 not null,
tokenExpires datetime2 not null,
roleName varchar(30) not null foreign key references Role(roleName),
Gender char(1),
CHECK (Gender IN ('M', 'F')),
ProfilePicture NVARCHAR(max)
);

Select * from Users
--passwordi i userId 10 Arber!@#$%12345
delete from Users where userId='3'
select * from Post
delete  from Post where userId='3'
create table Role(
roleId int not null identity(1,1),
roleName varchar(30) not null primary key
);
select * from Role
insert into Role values ('Admin')
delete from Users where username='arberejupi'
select * from Users

create TABLE Post (
    Id INT identity(1,1) primary key,
    UserId INT NOT NULL,
    Content VARCHAR(MAX),
    CreatedAt DATETIME,
    FOREIGN KEY (UserId) REFERENCES [Users](userId)
);
ALTER TABLE Post
ADD ImageUrl NVARCHAR(MAX);

-- Create Like Table
create TABLE [Like] (
    Id INT identity(1,1) primary key,
    UserId INT NOT NULL,
    PostId INT NOT NULL,
    CreatedAt DATETIME,
    FOREIGN KEY (UserId) REFERENCES [Users](userId),
    FOREIGN KEY (PostId) REFERENCES Post(Id)
);
SELECT name
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('SavedPost') AND referenced_object_id = OBJECT_ID('Post');

ALTER TABLE SavedPost
DROP CONSTRAINT FK_SavedPost_Post; -- Drop the existing foreign key constraint

ALTER TABLE SavedPost
ADD CONSTRAINT FK_SavedPost_Post
FOREIGN KEY (PostId)
REFERENCES Post(Id)
ON DELETE CASCADE;
-- Create Comment Table
create TABLE Comment (
    Id INT identity(1,1) primary key,
    UserId INT NOT NULL,
    PostId INT NOT NULL,
    Content VARCHAR(MAX),
    CreatedAt DATETIME,
    FOREIGN KEY (UserId) REFERENCES [Users](userId),
    FOREIGN KEY (PostId) REFERENCES Post(Id)
);

CREATE TABLE Connection123
(
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NOT NULL,
    [FriendId] INT NOT NULL,
    [Status] NVARCHAR(20) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2,
    
    CONSTRAINT [FK_Connection_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([userId]),
    CONSTRAINT [FK_Connection_Users_FriendId] FOREIGN KEY ([FriendId]) REFERENCES [dbo].[Users]([userId])
);

CREATE TABLE FriendRequest123
(
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NOT NULL,
    [RequesterId] INT NOT NULL,
    [Status] NVARCHAR(20) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2,
    
    CONSTRAINT [FK_FriendRequest_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([userId]),
    CONSTRAINT [FK_FriendRequest_Users_RequesterId] FOREIGN KEY ([RequesterId]) REFERENCES [dbo].[Users]([userId])
);

create TABLE SavedPost (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId int NOT NULL,
    PostId INT NOT NULL,
	Status VARCHAR(20) NOT NULL,
    CONSTRAINT FK_SavedPost_User FOREIGN KEY (UserId) REFERENCES [dbo].[Users]([userId]),
    CONSTRAINT FK_SavedPost_Post FOREIGN KEY (PostId) REFERENCES Post(Id)
);


create TABLE Friendship (
    RequestId INT PRIMARY KEY IDENTITY(1,1),
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    Status VARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    CONSTRAINT FK_Sender FOREIGN KEY (SenderId) REFERENCES Users (userId),
    CONSTRAINT FK_Receiver FOREIGN KEY (ReceiverId) REFERENCES Users (userId)
);
delete from Post where userId='6'
select*from Post
select * from Users
delete From Friendship where RequestId='149'
select * from Friendship
select* from PostImages
insert into PostImages values ('7','100',20145);

CREATE TABLE Messages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    MessageContent VARCHAR(MAX) NOT NULL,
    SentAt DATETIME NOT NULL,
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderId) REFERENCES Users(userId),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverId) REFERENCES Users(userId)
);

select* from Messages

create TABLE Notification (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    NotificationType NVARCHAR(50) NOT NULL,
    NotificationContent NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0, -- You can mark notifications as read when the user views them
    FOREIGN KEY (UserId) REFERENCES Users(userId)
);

select * from Notification
delete from Notification where isRead='0'
select* from users

Create table Director(
	DirectorId int identity(1,1) Primary key,
	Name varchar(50),
	BirthYear int 
)
Create table Movie (
	MovieId int identity(1,1) primary key,
	Title varchar(50),
	ReleaseYear int,
	DirectorId int foreign key references Director(DirectorId)
)