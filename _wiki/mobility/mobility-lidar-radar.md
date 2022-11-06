---
layout  : wiki
title   : Automotive Sensor and Telsa Vision
summary : 
date    : 2022-10-28 15:54:32 +0900
updated : 2022-10-28 20:15:24 +0900
tag     : mobility
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## Lidar

LIDAR is an acronym for __Light Detection and Ranging__. LIDAR normally measures a distance to an object by calculating the time taken by a pulse of light to travel to an object and back to the sensor.

- __How it works__
  - A lidar sensor transmits laser beams that bounce off objects and return to the sensor.
  - Based on the information received, a lidar system creates a point cloud that looks like a shadow and reflects the object’s shape and size.

LIDAR systems are larger and more __expensive__, usually mounted outside of the vehicle.

__How a car with lidar sees the world:__
- ![](/resource/wiki/mobility-lidar-radar/lidar-screen.png)

__An image from a patent filing shows how Alphabet’s self-driving cars use lidar to map the road ahead:__
- ![](/resource/wiki/mobility-lidar-radar/lidar-map.png)

## Radar

RADAR is short for __Radio Detection and Ranging__. Is considered as a conventional system which has been used for many in industries such as air traffic control, air-defense systems, antimissile systems, aircraft anti-collision systems, ocean surveillance systems, radar astronomy, space surveillance, meteorological precipitation monitoring and automotive industry for a couple of years. RADAR is well established mainly in automotive industry.

Using radio waves, a radar has a capability to determine an angle of objects, velocity, and range. A RADAR categorization is based on different operating distance ranges, starting from 0.2 m to more than 200m.

Advantages of RADAR is a __lighter weight__, a capability to operate in different conditions in comparison with a LIDAR and a longer range. However, Long range radar (LRR) has limitation. For instance, small vehicles, such as bicycles and motorcycles, or any other vehicles not driving in the center of the lane remain undetected by a RADAR sensor.

## Tesla vs Google

- __Related Articles__
  - [Tesla Announces New Sensors and Puts the Brakes on Autopilot](https://www.technologyreview.com/2016/10/20/156529/tesla-announces-new-sensors-and-puts-the-brakes-on-autopilot/)
  - [Tesla vs Google: Do LIDAR Sensors Belong in Autonomous Vehicles?](https://www.allaboutcircuits.com/news/tesla-vs-google-do-lidar-sensors-belong-in-autonomous-vehicles/)
  - [Tesla & Google Disagree About LIDAR — Which Is Right?](https://cleantechnica.com/2016/07/29/tesla-google-disagree-lidar-right/)

### Google's Use of LIDAR

Google self-driving cars use LIDAR, which maps out the car's surroundings using lasers. LIDAR measures the shape and contour of the ground from the sky. It reflects multiple laser pulses off of objects that surround the car and measures the distance and time that each pulse has traveled.

Google used Velodyne's 64 Channel LiDAR sensor, whic is priced at about $80,000 for just one sensor.

This might be one reason that Elon Musk refuses to use LIDAR technology in Tesla's Autopilot systems.

### Tesla's Use of Optical Sensors and RADAR

Like a LIDAR system, a RADAR system sends out signals, but in the form of periodic radio waves that bounce off of objects in the cars proximity. Once they hit an object and return to the car's system, it will measure the time it took for the radio waves to travel to and from the object.

The advantage of radio waves is that they __can be transmitted through rain, snow, fog, and even dust__. By comparison, laser beams used in LIDAR cannot.

![](/resource/wiki/mobility-lidar-radar/tesla.png)

## Tesla Vision

> Telsa Vision is new __camera-based__ autonomous driving system. __without radar__.

After years of using a suite of sensors that included both cameras and a radar, [Tesla announced a transition to its “Tesla Vision” system without radar](https://electrek.co/2021/05/25/tesla-vision-without-radar-warns-limitations-first/) and only using cameras and neural nets. So, [Tesla removed Radar and Ultrasonic sensors](https://www.youtube.com/watch?v=_W1JBAfV4Io). 이러한 결정을 내리게된 이유는 기술의 좋고 안좋고를 떠나서 __선택과 집중__ 의 결정이며, Elon Musk 의 __Simplify things__ 의 전략 때문이었다.

- __Related Articles__
  - [Tesla Vision Update: Replacing Ultrasonic Sensors with Tesla Vision](https://www.tesla.com/support/transitioning-tesla-vision)
  - [Tesla is changing the sensors in its cars. Here is why you should care](https://www.zdnet.com/article/tesla-removed-its-ultrasonic-sensors-from-its-cars-what-does-that-mean-for-your-tesla-vehicle-your-safety-and-teslas-future/)
  - [Why Tesla removed Radar and Ultrasonic sensors? | Andrej Karpathy and Lex Fridman](https://www.youtube.com/watch?v=_W1JBAfV4Io)

Safety is at the core of our design and engineering decisions. In 2021, we began our transition to Tesla Vision by removing radar from Model 3 and Model Y, followed by Model S and Model X in 2022. Today, in most regions around the globe, these vehicles now rely on __Tesla Vision, our camera-based Autopilot system__. [Tesla Model Y receives highest overall safety score in new European assessment](https://www.zdnet.com/article/tesla-model-y-received-highest-overall-safety-score-of-any-vehicle-ever-tested/).

테슬라가 Radar 를 제거하고 camera-based 로 간 이유중 하나는 __"더 적은 비용이 드는 기술을 선택하여 집중하자"__ 였지 않을까 생각한다.

## Links

- [How Sensor Fusion for Autonomous Cars Helps Avoid Deaths on the Road](https://intellias.com/sensor-fusion-autonomous-cars-helps-avoid-deaths-road/)
- [The Ultimate Sensor Battle: Lidar vs Radar](https://medium.com/@intellias/the-ultimate-sensor-battle-lidar-vs-radar-2ee0fb9de5da)
- [RADAR vs. LIDAR sensors in automotive industry](https://mse238blog.stanford.edu/2017/08/mj2017/radar-vs-lidar-sensors-in-automotive-industry/)
- [Self-Driving Cars’ Spinning-Laser Problem](https://www.technologyreview.com/2017/03/20/153129/autonomous-cars-lidar-sensors/)