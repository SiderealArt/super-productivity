import { Injectable } from '@angular/core';
import { SyncProvider, SyncProviderServiceInterface } from '../sync-provider.model';
import { Observable, of } from 'rxjs';
import { IS_ELECTRON } from '../../../app.constants';
import { AppDataComplete, SyncGetRevResult } from '../sync.model';
import { IPC } from '../../../../../electron/ipc-events.const';
import { ElectronService } from '../../../core/electron/electron.service';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocalFileSyncService implements SyncProviderServiceInterface {
  id: SyncProvider = SyncProvider.LocalFile;
  isUploadForcePossible?: boolean;
  isReady$: Observable<boolean> = of(IS_ELECTRON);

  private _filePath$: Observable<string | undefined> = of(
    '/home/xzy/Downloads/sp_sync.json',
  );
  private _filePathOnce$: Observable<string | undefined> = this._filePath$.pipe(first());

  constructor(private _electronService: ElectronService) {}

  async getRevAndLastClientUpdate(
    localRev: string | null,
  ): Promise<{ rev: string; clientUpdate?: number } | SyncGetRevResult> {
    const filePath = await this._filePathOnce$.toPromise();
    try {
      const r = await this._electronService.callMain(
        IPC.FILE_SYNC_GET_REV_AND_CLIENT_UPDATE,
        {
          filePath,
          localRev,
        },
      );
      return r as any;
    } catch (e) {
      throw new Error(e);
    }
  }

  async uploadAppData(
    data: AppDataComplete,
    localRev: string | null,
    isForceOverwrite?: boolean,
  ): Promise<string | Error> {
    const filePath = await this._filePathOnce$.toPromise();
    try {
      const r = (await this._electronService.callMain(IPC.FILE_SYNC_SAVE, {
        localRev,
        filePath,
        data,
      })) as Promise<string | Error>;
      return r as any;
    } catch (e) {
      throw new Error(e);
    }
  }

  async downloadAppData(
    localRev: string | null,
  ): Promise<{ rev: string; data: AppDataComplete | undefined }> {
    const filePath = await this._filePathOnce$.toPromise();
    try {
      const r = (await this._electronService.callMain(IPC.FILE_SYNC_LOAD, {
        localRev,
        filePath,
      })) as Promise<{ rev: string; data: AppDataComplete | undefined }>;
      return r as any;
    } catch (e) {
      throw new Error(e);
    }
  }
}