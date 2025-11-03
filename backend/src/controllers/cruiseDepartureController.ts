import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cruiseDepartureController = {
  // Get all departures for a cruise
  async getByCruiseId(req: Request, res: Response) {
    try {
      const { cruiseId } = req.params;
      const { upcoming = 'true', status } = req.query;

      const where: any = { cruiseId };

      if (upcoming === 'true') {
        where.departureDate = {
          gte: new Date(),
        };
      }

      if (status) {
        where.status = status;
      }

      const departures = await prisma.cruiseDeparture.findMany({
        where,
        include: {
          cruise: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
            },
          },
        },
        orderBy: {
          departureDate: 'asc',
        },
      });

      res.json({
        success: true,
        data: departures,
      });
    } catch (error: any) {
      console.error('Get departures error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departures',
        error: error.message,
      });
    }
  },

  // Get single departure
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const departure = await prisma.cruiseDeparture.findUnique({
        where: { id },
        include: {
          cruise: true,
        },
      });

      if (!departure) {
        return res.status(404).json({
          success: false,
          message: 'Departure not found',
        });
      }

      res.json({
        success: true,
        data: departure,
      });
    } catch (error: any) {
      console.error('Get departure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departure',
        error: error.message,
      });
    }
  },

  // Create departure
  async create(req: Request, res: Response) {
    try {
      const { cruiseId, departureDate, returnDate, availableSeats, priceModifier, status, notes } = req.body;

      // Verify cruise exists
      const cruise = await prisma.cruise.findUnique({
        where: { id: cruiseId },
      });

      if (!cruise) {
        return res.status(404).json({
          success: false,
          message: 'Cruise not found',
        });
      }

      // Validate dates
      const departure = new Date(departureDate);
      const returnDt = new Date(returnDate);

      if (returnDt <= departure) {
        return res.status(400).json({
          success: false,
          message: 'Return date must be after departure date',
        });
      }

      const cruiseDeparture = await prisma.cruiseDeparture.create({
        data: {
          cruiseId,
          departureDate: departure,
          returnDate: returnDt,
          availableSeats: availableSeats || cruise.capacity,
          priceModifier: priceModifier || 1.0,
          status: status || 'AVAILABLE',
          notes,
        },
        include: {
          cruise: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Departure created successfully',
        data: cruiseDeparture,
      });
    } catch (error: any) {
      console.error('Create departure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create departure',
        error: error.message,
      });
    }
  },

  // Create multiple departures (bulk)
  async createBulk(req: Request, res: Response) {
    try {
      const { cruiseId, departures } = req.body;

      if (!Array.isArray(departures) || departures.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Departures array is required',
        });
      }

      // Verify cruise exists
      const cruise = await prisma.cruise.findUnique({
        where: { id: cruiseId },
      });

      if (!cruise) {
        return res.status(404).json({
          success: false,
          message: 'Cruise not found',
        });
      }

      const createdDepartures = await prisma.$transaction(
        departures.map((dep: any) =>
          prisma.cruiseDeparture.create({
            data: {
              cruiseId,
              departureDate: new Date(dep.departureDate),
              returnDate: new Date(dep.returnDate),
              availableSeats: dep.availableSeats || cruise.capacity,
              priceModifier: dep.priceModifier || 1.0,
              status: dep.status || 'AVAILABLE',
              notes: dep.notes,
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: `${createdDepartures.length} departures created successfully`,
        data: createdDepartures,
      });
    } catch (error: any) {
      console.error('Create bulk departures error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create departures',
        error: error.message,
      });
    }
  },

  // Update departure
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { departureDate, returnDate, availableSeats, priceModifier, status, notes } = req.body;

      const existing = await prisma.cruiseDeparture.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Departure not found',
        });
      }

      const updateData: any = {};

      if (departureDate) updateData.departureDate = new Date(departureDate);
      if (returnDate) updateData.returnDate = new Date(returnDate);
      if (availableSeats !== undefined) updateData.availableSeats = availableSeats;
      if (priceModifier !== undefined) updateData.priceModifier = priceModifier;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const departure = await prisma.cruiseDeparture.update({
        where: { id },
        data: updateData,
        include: {
          cruise: true,
        },
      });

      res.json({
        success: true,
        message: 'Departure updated successfully',
        data: departure,
      });
    } catch (error: any) {
      console.error('Update departure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update departure',
        error: error.message,
      });
    }
  },

  // Delete departure
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.cruiseDeparture.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Departure not found',
        });
      }

      await prisma.cruiseDeparture.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Departure deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete departure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete departure',
        error: error.message,
      });
    }
  },

  // Update available seats (for bookings)
  async updateSeats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { seatsToBook } = req.body;

      const departure = await prisma.cruiseDeparture.findUnique({
        where: { id },
      });

      if (!departure) {
        return res.status(404).json({
          success: false,
          message: 'Departure not found',
        });
      }

      if (departure.availableSeats < seatsToBook) {
        return res.status(400).json({
          success: false,
          message: 'Not enough seats available',
        });
      }

      const newAvailableSeats = departure.availableSeats - seatsToBook;
      let newStatus = departure.status;

      // Auto-update status based on availability
      if (newAvailableSeats === 0) {
        newStatus = 'SOLD_OUT';
      } else if (newAvailableSeats <= 10) {
        newStatus = 'FILLING_FAST';
      }

      const updated = await prisma.cruiseDeparture.update({
        where: { id },
        data: {
          availableSeats: newAvailableSeats,
          status: newStatus,
        },
      });

      res.json({
        success: true,
        message: 'Seats updated successfully',
        data: updated,
      });
    } catch (error: any) {
      console.error('Update seats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update seats',
        error: error.message,
      });
    }
  },
};