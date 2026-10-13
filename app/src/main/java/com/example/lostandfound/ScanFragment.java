package com.example.lostandfound;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.content.ContentValues;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Toast;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.ImageProxy;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.InputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ScanFragment extends Fragment {

    private PreviewView viewFinder;
    private ImageView ivCapturedImage;
    private View vShutterFlash;
    private View pillActions;
    private ImageButton btnPillRetake, btnPillUpload;
    private ImageButton btnCapture, btnGallery, btnFlash;
    private ImageCapture imageCapture;
    private ExecutorService cameraExecutor;
    private Camera camera;
    private boolean isFlashOn = false;
    private Bitmap currentCapturedBitmap = null;
    private boolean isImageFromGallery = false;

    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    startCamera();
                } else {
                    Toast.makeText(getContext(), "Camera permission is required.", Toast.LENGTH_SHORT).show();
                }
            });

    private final ActivityResultLauncher<String> pickImageLauncher =
            registerForActivityResult(new ActivityResultContracts.GetContent(), uri -> {
                if (uri != null) {
                    displayImageFromGallery(uri);
                }
            });

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_scan, container, false);

        viewFinder = view.findViewById(R.id.viewFinder);
        ivCapturedImage = view.findViewById(R.id.iv_captured_image);
        vShutterFlash = view.findViewById(R.id.v_shutter_flash);
        pillActions = view.findViewById(R.id.pill_actions);
        btnPillRetake = view.findViewById(R.id.btn_pill_retake);
        btnPillUpload = view.findViewById(R.id.btn_pill_upload);
        btnCapture = view.findViewById(R.id.btn_capture);
        btnGallery = view.findViewById(R.id.btn_gallery);
        btnFlash = view.findViewById(R.id.btn_flash);

        cameraExecutor = Executors.newSingleThreadExecutor();

        if (allPermissionsGranted()) {
            startCamera();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }

        btnCapture.setOnClickListener(v -> takePhoto());
        btnGallery.setOnClickListener(v -> pickImageLauncher.launch("image/*"));
        btnFlash.setOnClickListener(v -> toggleFlash());

        btnPillRetake.setOnClickListener(v -> {
            if (isImageFromGallery) {
                pickImageLauncher.launch("image/*");
            } else {
                resetCameraView();
            }
        });

        btnPillUpload.setOnClickListener(v -> {
            if (currentCapturedBitmap != null) {
                saveBitmapToGallery(currentCapturedBitmap);
            }
        });

        return view;
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext());

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();

                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(viewFinder.getSurfaceProvider());

                imageCapture = new ImageCapture.Builder().build();

                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;

                cameraProvider.unbindAll();
                camera = cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageCapture);

            } catch (ExecutionException | InterruptedException e) {
                Log.e("ScanFragment", "Use case binding failed", e);
            }
        }, ContextCompat.getMainExecutor(requireContext()));
    }

    private void takePhoto() {
        if (imageCapture == null) return;

        // Visual flash animation for feedback
        vShutterFlash.setVisibility(View.VISIBLE);
        vShutterFlash.setAlpha(1f);
        vShutterFlash.animate()
                .alpha(0f)
                .setDuration(250)
                .setListener(new AnimatorListenerAdapter() {
                    @Override
                    public void onAnimationEnd(Animator animation) {
                        vShutterFlash.setVisibility(View.GONE);
                    }
                }).start();

        long timestamp = System.currentTimeMillis();
        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, timestamp);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
        if(Build.VERSION.SDK_INT > Build.VERSION_CODES.P) {
            contentValues.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/LostAndFound");
        }

        imageCapture.takePicture(ContextCompat.getMainExecutor(requireContext()), new ImageCapture.OnImageCapturedCallback() {
            @Override
            public void onCaptureSuccess(@NonNull ImageProxy image) {
                cameraExecutor.execute(() -> {
                    Bitmap bitmap = imageProxyToBitmap(image);

                    Matrix matrix = new Matrix();
                    matrix.postRotate(image.getImageInfo().getRotationDegrees());
                    Bitmap rotatedBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);

                    requireActivity().runOnUiThread(() -> {
                        isImageFromGallery = false;
                        currentCapturedBitmap = rotatedBitmap;
                        viewFinder.setVisibility(View.GONE);
                        ivCapturedImage.setVisibility(View.VISIBLE);
                        ivCapturedImage.setImageBitmap(rotatedBitmap);
                        pillActions.setVisibility(View.VISIBLE);
                        if (isFlashOn) {
                            toggleFlash();
                        }
                    });

                    image.close();
                });
            }

            @Override
            public void onError(@NonNull ImageCaptureException exception) {
                Log.e("ScanFragment", "Photo capture failed: " + exception.getMessage(), exception);
            }
        });
    }

    private void saveBitmapToGallery(Bitmap bitmap) {
        cameraExecutor.execute(() -> {
            try {
                long timestamp = System.currentTimeMillis();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, timestamp);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/LostAndFound");
                    contentValues.put(MediaStore.MediaColumns.IS_PENDING, 1);
                }

                Uri imageUri = requireContext().getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues);

                if (imageUri != null) {
                    java.io.OutputStream fos = requireContext().getContentResolver().openOutputStream(imageUri);
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos);
                    if (fos != null) fos.close();

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        contentValues.clear();
                        contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0);
                        requireContext().getContentResolver().update(imageUri, contentValues, null, null);
                    }

                    requireActivity().runOnUiThread(() -> {
                        Toast.makeText(getContext(), "The item has been saved to gallery successfully", Toast.LENGTH_SHORT).show();
                        resetCameraView();
                    });
                }
            } catch (Exception e) {
                e.printStackTrace();
                requireActivity().runOnUiThread(() ->
                    Toast.makeText(getContext(), "Failed to save photo.", Toast.LENGTH_SHORT).show()
                );
            }
        });
    }

    private Bitmap imageProxyToBitmap(ImageProxy image) {
        ByteBuffer buffer = image.getPlanes()[0].getBuffer();
        byte[] bytes = new byte[buffer.remaining()];
        buffer.get(bytes);
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
    }

    private void toggleFlash() {
        if (camera != null && camera.getCameraInfo().hasFlashUnit()) {
            isFlashOn = !isFlashOn;
            camera.getCameraControl().enableTorch(isFlashOn);
            // Optionally update icon here (e.g., using a different drawable)
            if (isFlashOn) {
                btnFlash.setColorFilter(ContextCompat.getColor(requireContext(), android.R.color.holo_orange_light));
            } else {
                btnFlash.setColorFilter(ContextCompat.getColor(requireContext(), R.color.brand_text));
            }
        }
    }

    private void displayImageFromGallery(Uri uri) {
        cameraExecutor.execute(() -> {
            try {
                InputStream inputStream = requireContext().getContentResolver().openInputStream(uri);

                // Decode bounds first to avoid OOM errors
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                BitmapFactory.decodeStream(requireContext().getContentResolver().openInputStream(uri), null, options);

                // Calculate inSampleSize (scale factor)
                options.inSampleSize = calculateInSampleSize(options, 1024, 1024);
                options.inJustDecodeBounds = false;

                // Decode full image with sample size
                Bitmap bitmap = BitmapFactory.decodeStream(inputStream, null, options);

                requireActivity().runOnUiThread(() -> {
                    isImageFromGallery = true;
                    currentCapturedBitmap = bitmap;
                    viewFinder.setVisibility(View.GONE);
                    ivCapturedImage.setVisibility(View.VISIBLE);
                    ivCapturedImage.setImageBitmap(bitmap);
                    pillActions.setVisibility(View.VISIBLE);
                });
            } catch (Exception e) {
                e.printStackTrace();
                requireActivity().runOnUiThread(() ->
                    Toast.makeText(getContext(), "Failed to load image", Toast.LENGTH_SHORT).show()
                );
            }
        });
    }

    private int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {
            final int halfHeight = height / 2;
            final int halfWidth = width / 2;
            while ((halfHeight / inSampleSize) >= reqHeight && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }
        return inSampleSize;
    }

    private void resetCameraView() {
        ivCapturedImage.setVisibility(View.GONE);
        pillActions.setVisibility(View.GONE);
        viewFinder.setVisibility(View.VISIBLE);
        currentCapturedBitmap = null;
        isImageFromGallery = false;
        isFlashOn = false;
        btnFlash.setColorFilter(ContextCompat.getColor(requireContext(), R.color.brand_text));
        // CameraX handles preview lifecycle automatically when viewFinder becomes visible again
    }

    private boolean allPermissionsGranted() {
        return ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        cameraExecutor.shutdown();
    }
}