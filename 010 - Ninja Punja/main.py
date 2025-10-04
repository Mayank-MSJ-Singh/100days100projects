name = input("Enter your name:- ")
while len(name)<1:
    name = input("Please Enter your name:- ")

from csv import *
with open("Score.csv",mode = "r") as scr_csv:
    pass
try:
 from pygame import*
 from random import *
 from math import *
 scr = display.set_mode((1000,650))
 n = image.load("inja.png")
 ic = image.load("inja-shuriken.png")
 n1 = []
 display.set_icon(ic)
 s = 0
 x = 500
 y = 300
 x_ = 0
 y_ = 0
 x1 = []
 y1 = []
 x1_ = 0
 y1_ = 0
 ten = 1
 t = 0.2
 sh = 1
 nx1, ny1, nx2, ny2 = -2050, 2050, -450, 450
 sx, sy= 450, 300
 for am in range(ten):
     x1.append(randint(nx1, ny1))
     y1.append(randint(nx2, ny2))
     n1.append(image.load("inja (1).png"))
 display.set_caption("Shuriken")
 while True:
     scr.fill((255, 255, 255))
     for e in event.get():
        if e.type == QUIT:
            exit()
        if e.type == KEYDOWN:
            if e.key == K_w or e.key == K_UP:
                y_= 2
                y1_ = -sh
              # y += 2
            elif e.key == K_s or e.key == K_DOWN:
                y_ = -2
                y1_ = sh
              #y -= 2
            if e.key == K_a or e.key == K_LEFT:
                x_ = 2
                x1_ = -sh
              #x += 2
            elif e.key == K_d or e.key == K_RIGHT:
               x_ = -2
               x1_ = sh
             #  y -= 2
        if e.type == KEYUP:
              if e.key == K_w or e.key == K_UP:
                y_ = y1_ = 0
              #  y += 0
              if e.key == K_s or e.key == K_DOWN:
                y_ = y1_ = 0
               #  y -= 0
              if e.key == K_a or e.key == K_LEFT:
                x_ = x1_ = 0
                # x += 0
              if e.key == K_d or e.key == K_RIGHT:
                x_ = x1_ = 0
                #x -= 0
     sx += x1_
     sy += y1_
     for an in range(0, ten):
      if x1[an] < 450:
         x1[an] += t
      elif x1[an] > 450:
         x1[an] -= t
      if y1[an] < 300:
         y1[an] += t
      elif y1[an] > 300:
         y1[an] -= t
      xd = sqrt(((450-x1[an])**2) + ((300-y1[an])**2))
      xs = sqrt(((sx-x1[an])**2) + ((sy-y1[an])**2))
      if xd <= 60:
        exit()
      if xs <=50:
          x1[an],y1[an] = randint(-100, 1100),randint(-100, 750)
          ten += 1
          x1.append(randint(nx1, ny1))
          # 1 kill = 10 points
          y1.append(randint(nx2, ny2))
          n1.append(image.load("inja (1).png"))
          s += 10
          sh += 0.0
      scr.blit(n1[an], (x1[an], y1[an]))
     scr.blit(n, (450,300))
     print("Score =",s)
     if sx <= 0:
         sx += sh
     elif sx >= 960:
         sx -= sh
     if sy <= 0:
         sy += sh
     elif sy >= 610:
         sy -= sh
     scr.blit(ic,(sx,sy))
     display.update()
except:
    with open("Score.csv","a") as scr_csv:
         m_csv = writer(scr_csv, delimiter = ",", lineterminator='\r')
         m_csv.writerow([name,s])
    scr_csv.close()