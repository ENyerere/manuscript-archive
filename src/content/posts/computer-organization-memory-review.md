---
title: 计组复盘：主存储器与 DRAM 刷新
slug: computer-organization-memory-review
excerpt: 边写边复习 DRAM 刷新、SRAM 与 DRAM 的区别，以及主存储器和 CPU 的连接与容量扩展。
tags:
  - 计组
  - 随笔
series: 计组笔记
createdAt: 2026-11-08
---

## 前言

这是第一篇「计组笔记」。之前学过的计算机系统概述、总线系统，还有一小部分主存储器，当时都没来得及整理，只能留到后面复习时补了。今天先从主存储器开始，边写边把课堂内容重新过一遍。

## DRAM 的刷新

![DRAM 的电容存储元结构](../post-assets/computer-organization-memory-review/01-dram-cell.webp)

之前学过，DRAM 是通过电容 Cs 是否存储电荷来表示 0/1 的。但电容里的电荷会慢慢漏掉，时间一长，数据就没了，所以得定时把原来的内容读出来再重新写入，这个过程叫「刷新」。

![DRAM 刷新时的行地址选择](../post-assets/computer-organization-memory-review/02-dram-refresh.webp)

以这张 2048×2048 的存储矩阵图为例，DRAM 是按行刷新的，所以要刷 2048 行，不是 2048×4 次。图里的 4 个存储矩阵会共用同一组行地址，同一行可以一起刷新。

刷新不需要外部另行提供行地址，它是芯片内部自动完成的。要刷新时，刷新控制和定时电路会控制二路选择器，改用刷新计数器给出的行地址，而不是正常读写时使用的行地址。刷新期间，外部暂时不能正常读写这块 DRAM。

这里还要引入「刷新周期」的概念：它指把整个存储器全部刷新一遍所允许的最大时间间隔。假设刷新周期是 64 ms，那就要在这段时间内把整个 DRAM 从头到尾刷完。因为外部可能一直在存取数据，所以刷新和正常读写需要交替安排，具体怎么交替，就是下面要说的刷新策略。

课程里提到了三种刷新策略：集中刷新、分散刷新和异步刷新。

### 集中刷新

集中刷新是在规定的一个刷新周期内，集中留出一段时间，把所有行逐行刷完。假设存储阵列是 128×128，刷新周期是 2 ms，存储周期是 0.5 μs，那么一个刷新周期就包含 4000 个存储周期。一次刷新可以近似看成一次读操作，占用一个存储周期，所以刷新 128 行一共需要 64 μs，如下图。

![集中刷新的时间分配](../post-assets/computer-organization-memory-review/03-burst-refresh.webp)

前面的 3872 个周期用于正常读写，最后的 128 个周期，也就是 64 μs，用于刷新。最后这一大块都是「死时间」，外部不能访问存储器，这非常烧心，所以实际很少这么用。

### 分散刷新

分散刷新是把每一行的刷新分散到各个存取周期里，每进行一次正常读写，就紧接着刷新一行。

![分散刷新的读写与刷新交替](../post-assets/computer-organization-memory-review/04-distributed-refresh.webp)

大白话就是读写一次之后顺便刷新，不用单独留一大块「死时间」。但代价呢？代价就是每次存取都变成「读写 + 刷新」两段，整个存取周期从 0.5 μs 拉长到 1 μs。128 个这样的周期就能把 128 行刷完，也就是 128 μs 就刷了一遍，比 2 ms 的要求频繁得多。说白了，刷新是分散了，读写速度也被明显拖慢了，还是非常烧心，所以这种方式也很少使用。

### 异步刷新

异步刷新就是前面两种方式的折中。

![异步刷新的时间间隔](../post-assets/computer-organization-memory-review/05-asynchronous-refresh.webp)

先算出平均每隔多久刷新一行：2 ms ÷ 128 ≈ 15.625 μs。然后每隔这么长的时间插入一次刷新，把单次「死时间」缩短到一个存储周期。这个方式就比较喵哈，既不用集中停工 64 μs，也不用每次都把存取周期翻倍，真是个大家一起包饺子的好结局。

## SRAM 和 DRAM 的区别

最后比较一下这两种 RAM，主要差别就在存储元的电路结构，如图：

![SRAM 与 DRAM 的存储元及特点对比](../post-assets/computer-organization-memory-review/06-sram-vs-dram.webp)

## 主存储器怎么和 CPU 连接？

前面讲了两种 RAM 的结构，现在来讲讲主存储器和 CPU 的连接方式。

![SRAM 存储芯片结构](../post-assets/computer-organization-memory-review/07-sram-chip.webp)

这是之前讲的 SRAM 二维译码结构。现在把它们整体看成一个集成电路，那这个芯片就有 12 位地址输入、8 位数据输入/输出，再加上 CS 和 WE 两个控制信号，这样的集成电路就是我们说的存储芯片。

受集成度和功耗等因素限制，单个存储芯片的容量不可能无限大，但现在电脑内存动不动就是 8 GB、16 GB，甚至更大，这是怎么做到的捏？这里就要讲讲主存储器容量的扩展了。不过在开始之前，还得先知道怎么计算存储器容量。

### 如何计算存储器的容量

![存储器容量的计算公式与示例](../post-assets/computer-organization-memory-review/08-memory-capacity.webp)

按照图中的公式和存储阵列，存储字数量 = 地址数量 = 2^22 = 4M，所以存储器容量就是 4M × 4 bit = 16 Mbit = 2 MB，这里 1 B = 8 bit。

讲完容量计算，再回到如何连接这个问题，如图：

![CPU、主存控制器与存储芯片的连接](../post-assets/computer-organization-memory-review/09-cpu-memory-controller.webp)

主存控制器负责拆分行列地址、定时刷新 DRAM，以及主存储器总线的控制。这里懒得继续展开了，先看图吧。

再看看 DRAM 与 CPU 的连接方式：

![DRAM 与 CPU 的总线连接](../post-assets/computer-organization-memory-review/10-dram-cpu-connection.webp)

值得一提的是，DRAM 虽然只有 11 个地址接口，但行地址和列地址可以分时复用这些接口，所以合起来还是能表示 22 位地址。MAR 用来暂存要访问的地址，MDR 用来暂存读出的或准备写入的数据。这里再提一嘴，CS 通常由高位地址译码产生，所以图上会把它和地址连接放在一起；但片选信号本身一般还是归为控制信号。

### 主存储器的扩展

刚刚已经学过怎么计算存储器容量了。想增加容量，可以尝试增加存储字长，也可以增加存储字数量，分别对应位扩展和字扩展。

#### 位扩展

几片芯片共用地址线和控制线，各自负责一部分数据位。比如两片 1K × 4 bit 的芯片可以拼成 1K × 8 bit，存储字数量不变，字长翻倍。

![16K × 1 位芯片的位扩展](../post-assets/computer-organization-memory-review/11-bit-extension-16k.webp)

![两片 1K × 4 bit 芯片组成 1K × 8 bit](../post-assets/computer-organization-memory-review/12-bit-extension-1k.webp)

#### 字扩展

字扩展就是存储字长不变，存储字数量增加。两片 1K × 8 bit 可以组成 2K × 8 bit，高位地址 A10 参与片选，决定哪一片工作，这就是图里要特别注意 CS 的原因。

![两片 1K × 8 bit 芯片的字扩展](../post-assets/computer-organization-memory-review/13-word-extension.webp)

#### 字位扩展

两个方向也可以一起扩。图中用 8 片 1K × 4 bit 的芯片，两片一组扩成 8 位，再通过高位地址译码选择不同的组，最后组成 4K × 8 bit 的存储器。

![主存储器的字位扩展](../post-assets/computer-organization-memory-review/14-word-bit-extension.webp)

今天先记到这里，前面落下的内容，之后再慢慢补。

