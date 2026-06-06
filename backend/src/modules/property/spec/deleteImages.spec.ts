import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { DeleteImagesCommandHandler } from '../application/commands/delete-images.handler';
import type { IPropertyRepo } from '../domain/repo-interface/IPropertyRepo.interface';
import { PropertyEntity } from '../domain/entities/Property.entity';
import { Address } from '../domain/value-objects/address.value';
import { IImage } from '../domain/entities/Image.entity';
import { DeleteImagesCommand } from '../application/commands/property.commands';
import { ForbiddenException } from '@nestjs/common';

describe('DeleteImagesCommandHandler', () => {
  let handler: DeleteImagesCommandHandler;
  let repository: jest.Mocked<IPropertyRepo>;

  const makeProperty = (hostId = 'host-1', images: IImage[] = []) =>
    PropertyEntity.create(
      {
        name: 'Test Property',
        description: 'A long enough description for the property',
        price: 100,
        maxGuests: 4,
        hostId,
        typeId: 'type-1',
        address: new Address('Amsterdam', 'Netherlands', 'St 1'),
      },
      images,
    );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteImagesCommandHandler,
        { provide: 'IPropertyRepo', useValue: createMock<IPropertyRepo>() },
      ],
    }).compile();

    handler = module.get(DeleteImagesCommandHandler);
    repository = module.get('IPropertyRepo');
  });

  describe('happy path', () => {
    it('deletes url from images and saves', async () => {
      const property = makeProperty('host-1', [
        { url: 'url1' },
        { url: 'url2' },
      ]);
      repository.getEntityById.mockResolvedValue(property);
      repository.save.mockResolvedValue(undefined);
      const command = new DeleteImagesCommand(['url1'], 'prop-1', 'host-1');
      await handler.execute(command);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(property.images.length).toBe(1);
      expect(property.images[0].data.url).toBe('url2');
    });

    it('deletion of non existing url → nothing changes, save is called', async () => {
      const property = makeProperty('host-1', [{ url: 'exist' }]);
      repository.getEntityById.mockResolvedValue(property);
      const command = new DeleteImagesCommand(
        ['non-existing'],
        'prop-1',
        'host-1',
      );
      await handler.execute(command);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(property.images.length).toBe(1);
      expect(property.images[0].data.url).toBe('exist');
    });

    it('deleting all images → updateImages is called with an empty array', async () => {
      const property = makeProperty('host-1', [{ url: 'url1' }]);
      repository.getEntityById.mockResolvedValue(property);
      const command = new DeleteImagesCommand(['url1'], 'prop-1', 'host-1');
      await handler.execute(command);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(property.images.length).toBe(0);
    });
  });

  describe('not host', () => {
    it('entity.isHost(userId) === false → ForbiddenException', async () => {
      const property = makeProperty('host-1', [{ url: 'url1' }]);
      repository.getEntityById.mockResolvedValue(property);
      const command = new DeleteImagesCommand(['url1'], 'prop-1', 'hacker');
      await expect(handler.execute(command)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('repository error', () => {
    it('getEntityById throws', async () => {
      repository.getEntityById.mockRejectedValue(new Error());
      const command = new DeleteImagesCommand(['url1'], 'prop-1', 'hacker');
      await expect(handler.execute(command)).rejects.toThrow(Error);
    });
  });
});
