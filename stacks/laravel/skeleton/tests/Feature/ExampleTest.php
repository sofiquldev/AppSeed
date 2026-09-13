<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_landing_page_returns_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
