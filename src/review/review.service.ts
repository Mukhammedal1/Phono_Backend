import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createReviewDto: CreateReviewDto) {
    return  await this.prisma.review.create({ data: createReviewDto});
  }

  async findAll() {
    return await this.prisma.review.findMany({include: {Phone: true}})
  }

 async  findOne(id: number) {
  const result  = await this.prisma.review.findUnique({where : { id} , include: {Phone: true}});
  if( !result ){
    throw new Error("ko'rib chiqanlar topilmadi")
  }
    return result ;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    return await this.prisma.review.update({
      where: {id},
      data: {...updateReviewDto}
    });
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.prisma.review.delete({where: {id}})

    return { message: "Juda ham chiroyli o'chirildi "} 
  }
}
