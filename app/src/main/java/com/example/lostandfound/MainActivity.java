package com.example.lostandfound;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.NavOptions;
import androidx.navigation.ui.NavigationUI;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable Edge-to-Edge full screen
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        setContentView(R.layout.activity_main);

        NavHostFragment navHostFragment = (NavHostFragment) getSupportFragmentManager().findFragmentById(R.id.nav_host_fragment);
        NavController navController = navHostFragment.getNavController();
        BottomNavigationView bottomNav = findViewById(R.id.bottom_nav_view);

        bottomNav.setOnItemSelectedListener(item -> {
            NavOptions navOptions = new NavOptions.Builder()
                    .setLaunchSingleTop(true)
                    .setRestoreState(true)
                    .setEnterAnim(R.anim.fade_in)
                    .setExitAnim(R.anim.fade_out)
                    .setPopEnterAnim(R.anim.fade_in)
                    .setPopExitAnim(R.anim.fade_out)
                    .build();
            navController.navigate(item.getItemId(), null, navOptions);
            return true;
        });

        bottomNav.setOnItemReselectedListener(item -> {
            // Ignore reselection
        });

        // Apply window insets to handle gesture bar at the bottom
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main_layout), (v, windowInsets) -> {
            androidx.core.graphics.Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(0, insets.top, 0, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }
}