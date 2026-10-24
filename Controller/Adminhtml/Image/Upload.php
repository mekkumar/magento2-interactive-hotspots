<?php
declare(strict_types=1);
namespace Kumar\InteractiveHotspots\Controller\Adminhtml\Image;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Filesystem;
use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\MediaStorage\Model\File\UploaderFactory;
use Magento\Framework\Filesystem\Io\File;

class Upload extends Action
{
    public const ADMIN_RESOURCE = 'Magento_PageBuilder::content';
    private JsonFactory $resultJsonFactory;
    private UploaderFactory $uploaderFactory;
    private Filesystem $filesystem;
    private File $ioFile;

    public function __construct(Context $context, JsonFactory $resultJsonFactory, UploaderFactory $uploaderFactory, Filesystem $filesystem, File $ioFile)
    {
        parent::__construct($context);
        $this->resultJsonFactory = $resultJsonFactory;
        $this->uploaderFactory = $uploaderFactory;
        $this->filesystem = $filesystem;
        $this->ioFile = $ioFile;
    }

    public function execute()
    {
        $result = $this->resultJsonFactory->create();
        try {
            $fileId = 'image';
            if (empty($_FILES[$fileId]['name'])) {
                throw new \RuntimeException(__('No image was received.')->render());
            }
            $uploader = $this->uploaderFactory->create(['fileId' => $fileId]);
            $uploader->setAllowedExtensions(['jpg', 'jpeg', 'png', 'gif', 'webp']);
            $uploader->setAllowRenameFiles(true);
            $uploader->setFilesDispersion(false);
            $media = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
            $target = 'kumar/interactivehotspots';
            $media->create($target);
            $saved = $uploader->save($media->getAbsolutePath($target));
            if (!$saved) {
                throw new \RuntimeException(__('The image could not be saved.')->render());
            }
            $saved['url'] = $this->_url->getBaseUrl(['_type' => \Magento\Framework\UrlInterface::URL_TYPE_MEDIA]) . $target . '/' . ltrim($saved['file'], '/');
            return $result->setData($saved);
        } catch (\Throwable $e) {
            return $result->setHttpResponseCode(400)->setData(['error' => true, 'message' => $e->getMessage()]);
        }
    }
}
